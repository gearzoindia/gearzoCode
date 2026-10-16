import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  QueryBookingsDto,
  AssignBookingDto,
  CancelBookingDto,
  AddBookingNoteDto,
} from './dto';
import { JurisdictionScopeContext } from '../../common/guards';
import { BookingStatus, CancelledBy, ActorType, Prisma } from '@gearzo/db';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private maskPhone(phone: string): string {
    return phone.replace(/(\+\d{2})(\d{3})\d{4}(\d{3})/, '$1 $2****$3');
  }

  async findAll(dto: QueryBookingsDto, scope: JurisdictionScopeContext) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    // Jurisdiction Scoping
    if (dto.areaId) {
      where.areaId = dto.areaId;
    } else if (!scope.isSuperAdmin) {
      where.areaId = { in: scope.subtreeIds };
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.from || dto.to) {
      where.createdAt = {};
      if (dto.from) where.createdAt.gte = new Date(dto.from);
      if (dto.to) where.createdAt.lte = new Date(dto.to);
    }

    if (dto.search) {
      where.OR = [
        { code: { contains: dto.search, mode: 'insensitive' } },
        { customer: { phone: { contains: dto.search } } },
        { customer: { name: { contains: dto.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          mechanic: { select: { id: true, name: true, phone: true } },
          area: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      items: items.map((b) => ({
        ...b,
        customer: b.customer
          ? {
              ...b.customer,
              phone: this.maskPhone(b.customer.phone),
            }
          : null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, scope: JurisdictionScopeContext, permissions: string[]) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            status: true,
          },
        },
        mechanic: {
          select: {
            id: true,
            name: true,
            phone: true,
            status: true,
            profile: { select: { shopName: true, ratingAvg: true } },
          },
        },
        area: { select: { id: true, name: true, level: true } },
        items: true,
        checklistItems: true,
        events: { orderBy: { createdAt: 'desc' } },
        payments: true,
        photos: true,
        disputes: { select: { id: true, status: true, category: true, createdAt: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking not found: ${id}`);
    }

    if (!scope.isSuperAdmin && !scope.subtreeIds.includes(booking.areaId)) {
      throw new ForbiddenException('Booking is outside your authorized jurisdiction');
    }

    const canViewFullCustomer = permissions.includes('CUSTOMER_VIEW');
    const customer = booking.customer
      ? {
          ...booking.customer,
          phone: canViewFullCustomer ? booking.customer.phone : this.maskPhone(booking.customer.phone),
        }
      : null;

    return {
      ...booking,
      customer,
    };
  }

  async assign(id: string, dto: AssignBookingDto, adminId: string, scope: JurisdictionScopeContext) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (!scope.isSuperAdmin && !scope.subtreeIds.includes(booking.areaId)) {
      throw new ForbiddenException('Booking is outside authorized jurisdiction');
    }

    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(`Cannot assign mechanic to a ${booking.status} booking`);
    }

    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: dto.mechanicId },
      include: { profile: true },
    });
    if (!mechanic) throw new NotFoundException('Mechanic not found');

    const previousMechanicId = booking.mechanicId;
    const newStatus = booking.status === BookingStatus.REQUESTED ? BookingStatus.ACCEPTED : booking.status;

    const updated = await this.prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          mechanicId: dto.mechanicId,
          status: newStatus,
        },
      });

      await tx.bookingEvent.create({
        data: {
          bookingId: id,
          fromStatus: booking.status,
          toStatus: newStatus,
          actorType: ActorType.ADMIN_ACTOR,
          actorId: adminId,
          note: `Mechanic manually reassigned from ${previousMechanicId || 'None'} to ${dto.mechanicId} by admin`,
        },
      });

      return b;
    });

    await this.audit.log({
      actorId: adminId,
      action: 'BOOKING_REASSIGN',
      entity: 'Booking',
      entityId: id,
      before: { mechanicId: previousMechanicId, status: booking.status },
      after: { mechanicId: dto.mechanicId, status: newStatus },
      reason: 'Manual dispatcher assignment',
    });

    return updated;
  }

  async cancel(id: string, dto: CancelBookingDto, adminId: string, scope: JurisdictionScopeContext) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (!scope.isSuperAdmin && !scope.subtreeIds.includes(booking.areaId)) {
      throw new ForbiddenException('Booking is outside authorized jurisdiction');
    }

    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(`Booking is already ${booking.status}`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledBy: CancelledBy.ADMIN,
          cancelReason: dto.reason,
        },
      });

      await tx.bookingEvent.create({
        data: {
          bookingId: id,
          fromStatus: booking.status,
          toStatus: BookingStatus.CANCELLED,
          actorType: ActorType.ADMIN_ACTOR,
          actorId: adminId,
          note: `Admin cancelled booking. Reason: ${dto.reason}${dto.waiveFee ? ' (Fee waived)' : ''}`,
        },
      });

      return b;
    });

    await this.audit.log({
      actorId: adminId,
      action: 'BOOKING_CANCEL',
      entity: 'Booking',
      entityId: id,
      before: { status: booking.status },
      after: { status: BookingStatus.CANCELLED, reason: dto.reason, waiveFee: dto.waiveFee },
      reason: dto.reason,
    });

    return updated;
  }

  async addNote(id: string, dto: AddBookingNoteDto, adminId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    const event = await this.prisma.bookingEvent.create({
      data: {
        bookingId: id,
        fromStatus: booking.status,
        toStatus: booking.status,
        actorType: ActorType.ADMIN_ACTOR,
        actorId: adminId,
        note: `Internal Note: ${dto.body}`,
      },
    });

    return event;
  }
}
