import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  CreateRefundDto,
  QueryPayoutRunsDto,
  MarkPayoutPaidDto,
  LedgerAdjustmentDto,
} from './dto';
import { JurisdictionScopeContext, AuthenticatedAdmin } from '../../common/guards';
import {
  ApprovalRequestType,
  PayoutRunStatus,
  PayoutStatus,
  RefundStatus,
  LedgerEntryType,
  WalletEntryType,
  PaymentOrderStatus,
  Prisma,
} from '@gearzo/db';

const REFUND_LIMITS_PAISE: Record<string, number> = {
  AREA_ADMIN: 0,
  SUB_DIVISIONAL_ADMIN: 50000, // ₹500
  DIVISIONAL_ADMIN: 200000, // ₹2,000
  SUPER_ADMIN: Infinity,
};

const LEDGER_ADJUSTMENT_LIMIT_PAISE = 500000; // ₹5,000 for Divisional Admin

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createRefund(dto: CreateRefundDto, admin: AuthenticatedAdmin) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { payments: true },
    });

    if (!booking) {
      throw new NotFoundException(`Booking not found: ${dto.bookingId}`);
    }

    const maxAllowed = REFUND_LIMITS_PAISE[admin.role] ?? 0;

    // If above limit -> create approval request
    if (dto.amountPaise > maxAllowed) {
      const approval = await this.prisma.approvalRequest.create({
        data: {
          type: ApprovalRequestType.REFUND_REQUEST,
          amountPaise: dto.amountPaise,
          jurisdictionId: booking.areaId,
          requestedById: admin.id,
          payload: {
            bookingId: dto.bookingId,
            bookingCode: booking.code,
            amountPaise: dto.amountPaise,
            reason: dto.reason,
            customerId: booking.customerId,
          },
        },
      });

      await this.audit.log({
        actorId: admin.id,
        action: 'REFUND_REQUESTED',
        entity: 'Booking',
        entityId: booking.id,
        reason: dto.reason,
        after: { amountPaise: dto.amountPaise, approvalRequestId: approval.id },
      });

      return {
        status: 'PENDING_APPROVAL',
        approvalRequestId: approval.id,
        message: 'Refund amount exceeds instant limit. Approval request forwarded to Divisional inbox.',
      };
    }

    // Direct execution within role limits
    const successfulPayment = booking.payments.find(
      (p) => p.status === PaymentOrderStatus.CAPTURED,
    ) || booking.payments[0];

    const refund = await this.prisma.$transaction(async (tx) => {
      let r = null;
      if (successfulPayment) {
        r = await tx.refund.create({
          data: {
            paymentId: successfulPayment.id,
            amountPaise: dto.amountPaise,
            status: RefundStatus.COMPLETED_REFUND,
            reason: dto.reason,
          },
        });
      }

      await tx.customerWalletLedger.create({
        data: {
          customerId: booking.customerId,
          bookingId: booking.id,
          type: WalletEntryType.REFUND,
          amountPaise: dto.amountPaise,
          note: `Admin refund: ${dto.reason}`,
          createdById: admin.id,
        },
      });

      return r;
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'REFUND_EXECUTED',
      entity: 'Booking',
      entityId: booking.id,
      reason: dto.reason,
      after: { amountPaise: dto.amountPaise, refundId: refund?.id },
    });

    return {
      status: 'PROCESSED',
      refundId: refund?.id,
      amountPaise: dto.amountPaise,
      message: 'Refund processed successfully and credited to customer wallet.',
    };
  }

  async findAllPayoutRuns(dto: QueryPayoutRunsDto, scope: JurisdictionScopeContext) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PayoutRunWhereInput = {};

    if (!scope.isSuperAdmin) {
      where.jurisdictionId = { in: scope.subtreeIds };
    }

    if (dto.status) {
      where.status = dto.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.payoutRun.findMany({
        where,
        include: {
          jurisdiction: { select: { id: true, name: true } },
          requestedBy: { select: { id: true, name: true, role: true } },
          approvedBy: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payoutRun.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOnePayoutRun(id: string, scope: JurisdictionScopeContext) {
    const run = await this.prisma.payoutRun.findUnique({
      where: { id },
      include: {
        jurisdiction: true,
        requestedBy: { select: { id: true, name: true, role: true } },
        approvedBy: { select: { id: true, name: true, role: true } },
        payouts: {
          include: {
            mechanic: {
              select: {
                id: true,
                name: true,
                phone: true,
                bankAccount: {
                  select: {
                    holderName: true,
                    accountLast4: true,
                    ifsc: true,
                    upiId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!run) throw new NotFoundException('Payout run not found');

    if (!scope.isSuperAdmin && !scope.subtreeIds.includes(run.jurisdictionId)) {
      throw new ForbiddenException('Payout run is outside authorized jurisdiction');
    }

    return run;
  }

  async preparePayoutRun(id: string, admin: AuthenticatedAdmin) {
    const run = await this.prisma.payoutRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundException('Payout run not found');

    if (run.status !== PayoutRunStatus.DRAFT) {
      throw new BadRequestException(`Payout run cannot be prepared in status ${run.status}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payoutRun.update({
        where: { id },
        data: {
          status: PayoutRunStatus.REQUESTED,
          requestedById: admin.id,
        },
      });

      await tx.approvalRequest.create({
        data: {
          type: ApprovalRequestType.PAYOUT_RUN,
          amountPaise: run.totalPaise,
          jurisdictionId: run.jurisdictionId,
          requestedById: admin.id,
          payload: {
            payoutRunId: id,
            mechanicCount: run.mechanicCount,
            totalPaise: run.totalPaise,
          },
        },
      });
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'PAYOUT_PREPARE',
      entity: 'PayoutRun',
      entityId: id,
      reason: 'Payout run submitted for maker-checker approval',
    });

    return { message: 'Payout run submitted for checker approval' };
  }

  async approvePayoutRun(id: string, admin: AuthenticatedAdmin) {
    const run = await this.prisma.payoutRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundException('Payout run not found');

    if (run.status !== PayoutRunStatus.REQUESTED) {
      throw new BadRequestException(`Payout run is not in REQUESTED status`);
    }

    // Enforce maker != checker (Super Admin exempted if configured, but enforced for separation of duties)
    if (run.requestedById === admin.id && admin.role !== 'SUPER_ADMIN') {
      throw new BadRequestException(
        'Maker-checker policy violation: The administrator who prepared the payout cannot approve it.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payoutRun.update({
        where: { id },
        data: {
          status: PayoutRunStatus.APPROVED_RUN,
          approvedById: admin.id,
        },
      });

      await tx.payout.updateMany({
        where: { payoutRunId: id },
        data: { status: PayoutStatus.APPROVED_PAYOUT },
      });
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'PAYOUT_APPROVE',
      entity: 'PayoutRun',
      entityId: id,
      reason: 'Maker-checker approval granted for payout run',
    });

    return { message: 'Payout run approved and ready for settlement' };
  }

  async markPayoutPaid(id: string, dto: MarkPayoutPaidDto, adminId: string) {
    const payout = await this.prisma.payout.findUnique({ where: { id } });
    if (!payout) throw new NotFoundException('Payout not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const p = await tx.payout.update({
        where: { id },
        data: {
          status: PayoutStatus.PAID_PAYOUT,
          utr: dto.utr,
          processedById: adminId,
        },
      });

      // Record in mechanic ledger as PAYOUT deduction
      await tx.mechanicLedger.create({
        data: {
          mechanicId: payout.mechanicId,
          type: LedgerEntryType.PAYOUT,
          amountPaise: -Math.abs(payout.amountPaise),
          note: `Bank payout settled UTR: ${dto.utr}`,
          createdById: adminId,
        },
      });

      return p;
    });

    await this.audit.log({
      actorId: adminId,
      action: 'PAYOUT_SETTLE',
      entity: 'Payout',
      entityId: id,
      after: { utr: dto.utr, status: PayoutStatus.PAID_PAYOUT },
      reason: 'Recorded bank settlement UTR',
    });

    return updated;
  }

  async adjustLedger(dto: LedgerAdjustmentDto, admin: AuthenticatedAdmin) {
    const mechanic = await this.prisma.mechanic.findUnique({ where: { id: dto.mechanicId } });
    if (!mechanic) throw new NotFoundException('Mechanic not found');

    const absAmount = Math.abs(dto.amountPaise);

    // Limit check for Divisional Admin
    if (admin.role === 'DIVISIONAL_ADMIN' && absAmount > LEDGER_ADJUSTMENT_LIMIT_PAISE) {
      const approval = await this.prisma.approvalRequest.create({
        data: {
          type: ApprovalRequestType.LEDGER_ADJUSTMENT,
          amountPaise: absAmount,
          jurisdictionId: mechanic.areaId || admin.jurisdictionId || 'global',
          requestedById: admin.id,
          payload: {
            mechanicId: dto.mechanicId,
            amountPaise: dto.amountPaise,
            reason: dto.reason,
          },
        },
      });

      await this.audit.log({
        actorId: admin.id,
        action: 'LEDGER_ADJUSTMENT_REQUESTED',
        entity: 'Mechanic',
        entityId: dto.mechanicId,
        reason: dto.reason,
        after: { amountPaise: dto.amountPaise, approvalRequestId: approval.id },
      });

      return {
        status: 'PENDING_APPROVAL',
        approvalRequestId: approval.id,
        message: 'Adjustment exceeds Divisional limit. Forwarded for Super Admin approval.',
      };
    }

    const entry = await this.prisma.mechanicLedger.create({
      data: {
        mechanicId: dto.mechanicId,
        type: LedgerEntryType.ADJUSTMENT,
        amountPaise: dto.amountPaise,
        note: `Administrative Adjustment: ${dto.reason}`,
        createdById: admin.id,
      },
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'LEDGER_ADJUST',
      entity: 'MechanicLedger',
      entityId: entry.id,
      after: { mechanicId: dto.mechanicId, amountPaise: dto.amountPaise },
      reason: dto.reason,
    });

    return {
      status: 'PROCESSED',
      ledgerEntryId: entry.id,
      message: 'Ledger adjustment posted successfully',
    };
  }
}
