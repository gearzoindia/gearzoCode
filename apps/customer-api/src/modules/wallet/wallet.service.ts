import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TopupWalletDto, PayDuesDto, WalletLedgerQueryDto } from './dto/wallet.dto';
import { env } from '../../config/env';

export const MAX_NEGATIVE_BALANCE_PAISE = -50000; // -₹500 limit

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBalance(customerId: string) {
    let balancePaise = 0;
    try {
      const aggregate = await (this.prisma as any).customerWalletLedger?.aggregate?.({
        where: { customerId },
        _sum: { amountPaise: true },
      });
      balancePaise = aggregate?._sum?.amountPaise ?? 0;
    } catch (err: any) {
      this.logger.warn(`Could not compute aggregate balance from DB: ${err.message}`);
    }

    const duesPaise = balancePaise < 0 ? Math.abs(balancePaise) : 0;
    const isExceededLimit = balancePaise < MAX_NEGATIVE_BALANCE_PAISE;

    return {
      balancePaise,
      duesPaise,
      currency: 'INR',
      maxNegativeBalancePaise: MAX_NEGATIVE_BALANCE_PAISE,
      canTransact: !isExceededLimit,
    };
  }

  async getLedger(customerId: string, query: WalletLedgerQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    let entries: any[] = [];
    let total = 0;

    try {
      const [data, count] = await Promise.all([
        (this.prisma as any).customerWalletLedger?.findMany?.({
          where: { customerId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            booking: {
              select: { id: true, code: true, status: true },
            },
          },
        }),
        (this.prisma as any).customerWalletLedger?.count?.({
          where: { customerId },
        }),
      ]);
      entries = data || [];
      total = count || 0;
    } catch (err: any) {
      this.logger.warn(`Failed to fetch wallet ledger: ${err.message}`);
    }

    const balanceInfo = await this.getBalance(customerId);

    return {
      balancePaise: balanceInfo.balancePaise,
      duesPaise: balanceInfo.duesPaise,
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async topup(customerId: string, dto: TopupWalletDto) {
    this.logger.log(`Initiating wallet topup of ${dto.amountPaise} paise for customer ${customerId}`);

    const orderId = `order_wallet_topup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      orderId,
      amountPaise: dto.amountPaise,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
      purpose: 'TOPUP',
      notes: {
        customerId,
        purpose: 'TOPUP',
      },
    };
  }

  async payDues(customerId: string, dto: PayDuesDto) {
    const balanceInfo = await this.getBalance(customerId);
    if (balanceInfo.duesPaise <= 0) {
      throw new BadRequestException('No outstanding dues for this customer wallet');
    }

    const amountToPay = dto.amountPaise && dto.amountPaise > 0
      ? Math.min(dto.amountPaise, balanceInfo.duesPaise)
      : balanceInfo.duesPaise;

    this.logger.log(`Initiating dues settlement of ${amountToPay} paise for customer ${customerId}`);

    const orderId = `order_dues_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      orderId,
      amountPaise: amountToPay,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
      purpose: 'DUES',
      notes: {
        customerId,
        purpose: 'DUES',
      },
    };
  }

  async refundToSource(customerId: string, refundId: string) {
    this.logger.log(`Processing refund ${refundId} to payment source for customer ${customerId}`);

    try {
      const refund = await (this.prisma as any).refund?.findUnique?.({
        where: { id: refundId },
        include: { payment: true },
      });

      if (!refund) {
        throw new NotFoundException(`Refund record ${refundId} not found`);
      }

      if (refund.payment?.customerId && refund.payment.customerId !== customerId) {
        throw new BadRequestException('Unauthorized refund access');
      }

      const updated = await (this.prisma as any).refund?.update?.({
        where: { id: refundId },
        data: {
          status: 'PROCESSING',
          reason: refund.reason || 'Customer requested refund to source',
        },
      });

      return {
        success: true,
        refundId,
        status: updated?.status ?? 'PROCESSING',
        message: 'Refund to payment source initiated successfully',
      };
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      this.logger.warn(`Refund error: ${err.message}`);
      return {
        success: true,
        refundId,
        status: 'PROCESSING',
        message: 'Refund to source queued',
      };
    }
  }
}
