import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { SessionService } from '@gearzo/auth';
import { QueryCustomersDto, BlockCustomerDto } from './dto';
import { JurisdictionScopeContext } from '../../common/guards';
import { AccountStatus, Prisma } from '@gearzo/db';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly sessionService: SessionService,
  ) {}

  private maskPhone(phone: string): string {
    return phone.replace(/(\+\d{2})(\d{3})\d{4}(\d{3})/, '$1 $2****$3');
  }

  async findAll(dto: QueryCustomersDto, scope: JurisdictionScopeContext) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    // Jurisdiction Scoping
    if (!scope.isSuperAdmin) {
      where.OR = [
        { addresses: { some: { areaId: { in: scope.subtreeIds } } } },
        { bookings: { some: { areaId: { in: scope.subtreeIds } } } },
      ];
    }

    if (dto.search) {
      const searchConditions: Prisma.CustomerWhereInput[] = [
        { name: { contains: dto.search, mode: 'insensitive' } },
        { phone: { contains: dto.search } },
        { bookings: { some: { code: { contains: dto.search, mode: 'insensitive' } } } },
      ];

      if (where.OR) {
        where.AND = [{ OR: searchConditions }];
      } else {
        where.OR = searchConditions;
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          city: { select: { id: true, name: true } },
          _count: {
            select: { bookings: true, vehicles: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      items: items.map((c) => ({
        id: c.id,
        name: c.name,
        phone: this.maskPhone(c.phone),
        email: c.email,
        status: c.status,
        city: c.city?.name,
        bookingCount: c._count.bookings,
        vehicleCount: c._count.vehicles,
        createdAt: c.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, scope: JurisdictionScopeContext) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        city: true,
        vehicles: {
          include: { brand: true, model: true },
          where: { deletedAt: null },
        },
        addresses: {
          select: {
            id: true,
            label: true,
            areaId: true,
            isDefault: true,
            createdAt: true,
            area: { select: { id: true, name: true } },
          },
        },
        bookings: {
          select: {
            id: true,
            code: true,
            status: true,
            serviceMode: true,
            estimatedTotalPaise: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
          take: 5,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer not found: ${id}`);
    }

    return {
      ...customer,
      phone: this.maskPhone(customer.phone),
    };
  }

  async block(id: string, dto: BlockCustomerDto, adminId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    await this.prisma.customer.update({
      where: { id },
      data: {
        status: AccountStatus.BLOCKED,
        tokenVersion: { increment: 1 },
      },
    });

    await this.sessionService.revokeAllSessions(id, 'customer');

    await this.audit.log({
      actorId: adminId,
      action: 'CUSTOMER_BLOCK',
      entity: 'Customer',
      entityId: id,
      before: { status: customer.status },
      after: { status: AccountStatus.BLOCKED },
      reason: dto.reason,
    });

    return { message: 'Customer has been blocked and sessions invalidated' };
  }

  async unblock(id: string, dto: BlockCustomerDto, adminId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    await this.prisma.customer.update({
      where: { id },
      data: { status: AccountStatus.ACTIVE },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'CUSTOMER_UNBLOCK',
      entity: 'Customer',
      entityId: id,
      before: { status: customer.status },
      after: { status: AccountStatus.ACTIVE },
      reason: dto.reason,
    });

    return { message: 'Customer has been unblocked' };
  }
}
