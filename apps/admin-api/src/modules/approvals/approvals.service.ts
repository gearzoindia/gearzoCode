import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { QueryApprovalsDto, ApproveRequestDto, RejectRequestDto } from './dto';
import { JurisdictionScopeContext, AuthenticatedAdmin } from '../../common/guards';
import {
  ApprovalRequestStatus,
  ApprovalRequestType,
  MechanicStatus,
  PayoutRunStatus,
  PayoutStatus,
  LedgerEntryType,
  WalletEntryType,
  RefundStatus,
  Prisma,
} from '@gearzo/db';

const ROLE_RANK: Record<string, number> = {
  AREA_ADMIN: 1,
  SUB_DIVISIONAL_ADMIN: 2,
  DIVISIONAL_ADMIN: 3,
  SUPER_ADMIN: 4,
};

const MIN_ROLE_REQUIRED: Record<ApprovalRequestType, number> = {
  SUSPENSION_REQUEST: 2, // Sub-Divisional+
  AREA_DEACTIVATION: 2, // Sub-Divisional+
  REFUND_REQUEST: 3, // Divisional+
  LEDGER_ADJUSTMENT: 3, // Divisional+
  PAYOUT_RUN: 3, // Divisional+
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(dto: QueryApprovalsDto, admin: AuthenticatedAdmin, scope: JurisdictionScopeContext) {
    const statusMap: Record<string, ApprovalRequestStatus> = {
      pending: ApprovalRequestStatus.PENDING_REQUEST,
      approved: ApprovalRequestStatus.APPROVED_REQUEST,
      rejected: ApprovalRequestStatus.REJECTED_REQUEST,
      expired: ApprovalRequestStatus.EXPIRED_REQUEST,
    };

    const status = statusMap[dto.status || 'pending'] ?? ApprovalRequestStatus.PENDING_REQUEST;

    const where: Prisma.ApprovalRequestWhereInput = { status };

    if (!scope.isSuperAdmin) {
      where.jurisdictionId = { in: scope.subtreeIds };
    }

    const items = await this.prisma.approvalRequest.findMany({
      where,
      include: {
        requestedBy: { select: { id: true, name: true, role: true, email: true } },
        decidedBy: { select: { id: true, name: true, role: true } },
        jurisdiction: { select: { id: true, name: true, level: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return items;
  }

  async approve(id: string, dto: ApproveRequestDto, admin: AuthenticatedAdmin, reAuthAt?: number) {
    const req = await this.prisma.approvalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Approval request not found');

    if (req.status !== ApprovalRequestStatus.PENDING_REQUEST) {
      throw new BadRequestException(`Approval request is already ${req.status}`);
    }

    // 1. Maker != Checker validation
    if (req.requestedById === admin.id && admin.role !== 'SUPER_ADMIN') {
      throw new BadRequestException(
        'Maker-checker separation policy violation: You cannot approve your own request.',
      );
    }

    // 2. Sufficient Role Rank
    const adminRank = ROLE_RANK[admin.role] ?? 0;
    const requiredRank = MIN_ROLE_REQUIRED[req.type] ?? 4;
    if (adminRank < requiredRank) {
      throw new ForbiddenException(
        `Insufficient administrative rank to approve ${req.type}. Minimum rank required is level ${requiredRank}.`,
      );
    }

    // 3. Re-Auth check for money actions
    const isMoneyAction =
      req.type === ApprovalRequestType.REFUND_REQUEST ||
      req.type === ApprovalRequestType.LEDGER_ADJUSTMENT ||
      req.type === ApprovalRequestType.PAYOUT_RUN;

    if (isMoneyAction) {
      const now = Date.now();
      if (!reAuthAt || now - reAuthAt > FIVE_MINUTES_MS) {
        throw new ForbiddenException(
          'Re-authentication required. Please verify credentials within the last 5 minutes to approve financial transactions.',
        );
      }
    }

    const payload = req.payload as Record<string, any>;
    const now = new Date();

    // 4. Execute approved action
    await this.prisma.$transaction(async (tx) => {
      switch (req.type) {
        case ApprovalRequestType.REFUND_REQUEST: {
          const { bookingId, amountPaise, reason, customerId } = payload;
          await tx.customerWalletLedger.create({
            data: {
              customerId,
              bookingId,
              type: WalletEntryType.REFUND,
              amountPaise,
              note: `Approved refund #${id.substring(0, 8)}: ${reason}`,
              createdById: admin.id,
            },
          });
          break;
        }

        case ApprovalRequestType.LEDGER_ADJUSTMENT: {
          const { mechanicId, amountPaise, reason } = payload;
          await tx.mechanicLedger.create({
            data: {
              mechanicId,
              type: LedgerEntryType.ADJUSTMENT,
              amountPaise,
              note: `Approved adjustment #${id.substring(0, 8)}: ${reason}`,
              createdById: admin.id,
            },
          });
          break;
        }

        case ApprovalRequestType.PAYOUT_RUN: {
          const { payoutRunId } = payload;
          if (payoutRunId) {
            await tx.payoutRun.update({
              where: { id: payoutRunId },
              data: {
                status: PayoutRunStatus.APPROVED_RUN,
                approvedById: admin.id,
              },
            });
            await tx.payout.updateMany({
              where: { payoutRunId },
              data: { status: PayoutStatus.APPROVED_PAYOUT },
            });
          }
          break;
        }

        case ApprovalRequestType.SUSPENSION_REQUEST: {
          const { mechanicId } = payload;
          if (mechanicId) {
            await tx.mechanic.update({
              where: { id: mechanicId },
              data: {
                status: MechanicStatus.SUSPENDED,
                tokenVersion: { increment: 1 },
              },
            });
          }
          break;
        }

        case ApprovalRequestType.AREA_DEACTIVATION: {
          const { areaId } = payload;
          if (areaId) {
            await tx.jurisdiction.update({
              where: { id: areaId },
              data: { isActive: false },
            });
          }
          break;
        }
      }

      await tx.approvalRequest.update({
        where: { id },
        data: {
          status: ApprovalRequestStatus.APPROVED_REQUEST,
          decidedById: admin.id,
          decisionNote: dto.note,
          decidedAt: now,
        },
      });
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'APPROVAL_DECIDE_APPROVE',
      entity: 'ApprovalRequest',
      entityId: id,
      after: { status: ApprovalRequestStatus.APPROVED_REQUEST, note: dto.note },
      reason: dto.note || 'Approved by authorized admin',
    });

    return { message: 'Approval request granted and corresponding action executed' };
  }

  async reject(id: string, dto: RejectRequestDto, admin: AuthenticatedAdmin) {
    const req = await this.prisma.approvalRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Approval request not found');

    if (req.status !== ApprovalRequestStatus.PENDING_REQUEST) {
      throw new BadRequestException(`Approval request is already ${req.status}`);
    }

    if (req.requestedById === admin.id && admin.role !== 'SUPER_ADMIN') {
      throw new BadRequestException('You cannot reject your own request.');
    }

    await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: ApprovalRequestStatus.REJECTED_REQUEST,
        decidedById: admin.id,
        decisionNote: dto.note,
        decidedAt: new Date(),
      },
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'APPROVAL_DECIDE_REJECT',
      entity: 'ApprovalRequest',
      entityId: id,
      after: { status: ApprovalRequestStatus.REJECTED_REQUEST, note: dto.note },
      reason: dto.note,
    });

    return { message: 'Approval request rejected' };
  }
}
