import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  QueryDisputesDto,
  AddDisputeMessageDto,
  ResolveDisputeDto,
  EscalateDisputeDto,
} from './dto';
import { JurisdictionScopeContext } from '../../common/guards';
import {
  DisputeStatus,
  ActorType,
  WalletEntryType,
  LedgerEntryType,
  Prisma,
} from '@gearzo/db';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(dto: QueryDisputesDto, scope: JurisdictionScopeContext) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DisputeWhereInput = {};

    // Jurisdiction Scoping via Booking
    if (!scope.isSuperAdmin) {
      where.booking = { areaId: { in: scope.subtreeIds } };
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.from || dto.to) {
      where.createdAt = {};
      if (dto.from) where.createdAt.gte = new Date(dto.from);
      if (dto.to) where.createdAt.lte = new Date(dto.to);
    }

    const [items, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              code: true,
              areaId: true,
              customer: { select: { id: true, name: true, phone: true } },
              mechanic: { select: { id: true, name: true, phone: true } },
            },
          },
          assignedAdmin: { select: { id: true, name: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.dispute.count({ where }),
    ]);

    const now = Date.now();

    return {
      items: items.map((d) => {
        const ageHours = (now - new Date(d.createdAt).getTime()) / (1000 * 60 * 60);
        const resolutionSlaBreached = ageHours > 48 && d.status !== DisputeStatus.RESOLVED && d.status !== DisputeStatus.CLOSED;
        const firstResponseSlaBreached = ageHours > 2 && d._count.messages === 0;

        return {
          ...d,
          sla: {
            firstResponseBreached: firstResponseSlaBreached,
            resolutionBreached: resolutionSlaBreached,
            dueAt: d.slaDueAt || new Date(new Date(d.createdAt).getTime() + 48 * 60 * 60 * 1000),
          },
        };
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, scope: JurisdictionScopeContext) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            mechanic: { select: { id: true, name: true, phone: true } },
            items: true,
          },
        },
        assignedAdmin: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute not found: ${id}`);
    }

    if (
      !scope.isSuperAdmin &&
      dispute.booking?.areaId &&
      !scope.subtreeIds.includes(dispute.booking.areaId)
    ) {
      throw new ForbiddenException('Dispute is outside authorized jurisdiction');
    }

    return dispute;
  }

  async addMessage(id: string, dto: AddDisputeMessageDto, adminId: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.disputeMessage.create({
        data: {
          disputeId: id,
          authorType: ActorType.ADMIN_ACTOR,
          authorId: adminId,
          body: dto.body,
          isInternal: dto.isInternal ?? false,
          attachments: dto.attachments || [],
        },
      });

      if (dispute.status === DisputeStatus.OPEN) {
        await tx.dispute.update({
          where: { id },
          data: { status: DisputeStatus.IN_REVIEW },
        });
      }

      return msg;
    });

    return message;
  }

  async resolve(id: string, dto: ResolveDisputeDto, adminId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { booking: true },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.dispute.update({
        where: { id },
        data: {
          status: DisputeStatus.RESOLVED,
          resolution: dto.resolution,
        },
      });

      // Internal message recording resolution
      await tx.disputeMessage.create({
        data: {
          disputeId: id,
          authorType: ActorType.ADMIN_ACTOR,
          authorId: adminId,
          body: `Dispute Resolved: ${dto.resolution}${dto.note ? `\nNote: ${dto.note}` : ''}`,
          isInternal: true,
        },
      });

      // Process optional customer wallet refund
      if (dto.refundPaise && dto.refundPaise > 0 && dispute.booking) {
        await tx.customerWalletLedger.create({
          data: {
            customerId: dispute.booking.customerId,
            bookingId: dispute.booking.id,
            type: WalletEntryType.REFUND,
            amountPaise: dto.refundPaise,
            note: `Dispute settlement refund #${dispute.id.substring(0, 8)}`,
            createdById: adminId,
          },
        });
      }

      // Process optional mechanic penalty deduction
      if (
        dto.mechanicPenaltyPaise &&
        dto.mechanicPenaltyPaise > 0 &&
        dispute.booking?.mechanicId
      ) {
        await tx.mechanicLedger.create({
          data: {
            mechanicId: dispute.booking.mechanicId,
            bookingId: dispute.booking.id,
            type: LedgerEntryType.PENALTY,
            amountPaise: -Math.abs(dto.mechanicPenaltyPaise),
            note: `Dispute penalty deduction #${dispute.id.substring(0, 8)}`,
            createdById: adminId,
          },
        });
      }

      return updated;
    });

    await this.audit.log({
      actorId: adminId,
      action: 'DISPUTE_RESOLVE',
      entity: 'Dispute',
      entityId: id,
      before: { status: dispute.status },
      after: {
        status: DisputeStatus.RESOLVED,
        resolution: dto.resolution,
        refundPaise: dto.refundPaise,
        mechanicPenaltyPaise: dto.mechanicPenaltyPaise,
      },
      reason: dto.note || dto.resolution,
    });

    return result;
  }

  async escalate(id: string, dto: EscalateDisputeDto, adminId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { booking: { include: { area: true } } },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    const result = await this.prisma.$transaction(async (tx) => {
      // Find parent administrative jurisdiction if available
      let newAssigneeId: string | null = null;
      if (dispute.booking?.area?.parentId) {
        const parentAdmin = await tx.admin.findFirst({
          where: { jurisdictionId: dispute.booking.area.parentId, status: 'ACTIVE' },
        });
        if (parentAdmin) newAssigneeId = parentAdmin.id;
      }

      const updated = await tx.dispute.update({
        where: { id },
        data: {
          status: DisputeStatus.ESCALATED,
          assignedAdminId: newAssigneeId ?? dispute.assignedAdminId,
        },
      });

      await tx.disputeMessage.create({
        data: {
          disputeId: id,
          authorType: ActorType.ADMIN_ACTOR,
          authorId: adminId,
          body: `Dispute Escalated to Higher Tier: ${dto.note}`,
          isInternal: true,
        },
      });

      return updated;
    });

    await this.audit.log({
      actorId: adminId,
      action: 'DISPUTE_ESCALATE',
      entity: 'Dispute',
      entityId: id,
      before: { status: dispute.status },
      after: { status: DisputeStatus.ESCALATED, note: dto.note },
      reason: dto.note,
    });

    return result;
  }
}
