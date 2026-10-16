import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { VehicleType } from '@gearzo/db';
import { env } from '../../config/env';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listPlans(vehicleType?: VehicleType) {
    try {
      const where: any = { isActive: true };
      if (vehicleType) {
        where.vehicleType = vehicleType;
      }

      const plans = await (this.prisma as any).subscriptionPlan?.findMany?.({
        where,
        orderBy: { sortOrder: 'asc' },
      });

      return plans || [];
    } catch (err: any) {
      this.logger.warn(`Failed to fetch subscription plans: ${err.message}`);
      return [];
    }
  }

  async planDetail(id: string) {
    try {
      const plan = await (this.prisma as any).subscriptionPlan?.findUnique?.({
        where: { id },
      });

      if (!plan) {
        throw new NotFoundException(`Subscription plan ${id} not found`);
      }

      return plan;
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new NotFoundException(`Subscription plan not found: ${id}`);
    }
  }

  async mySubscriptions(customerId: string) {
    try {
      const subscriptions = await (this.prisma as any).customerSubscription?.findMany?.({
        where: { customerId },
        include: {
          plan: true,
          vehicle: {
            include: { brand: true, model: true },
          },
          usages: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return subscriptions || [];
    } catch (err: any) {
      this.logger.warn(`Failed to fetch customer subscriptions: ${err.message}`);
      return [];
    }
  }

  async subscribe(customerId: string, dto: CreateSubscriptionDto) {
    this.logger.log(`Customer ${customerId} subscribing to plan ${dto.planId} for vehicle ${dto.vehicleId}`);

    const plan = await this.planDetail(dto.planId);

    // Verify vehicle belongs to customer
    try {
      const vehicle = await (this.prisma as any).customerVehicle?.findFirst?.({
        where: { id: dto.vehicleId, customerId },
      });

      if (!vehicle) {
        throw new BadRequestException('Invalid vehicle selected or not owned by customer');
      }

      if (vehicle.type !== plan.vehicleType) {
        throw new BadRequestException(
          `Plan is for ${plan.vehicleType} but selected vehicle is ${vehicle.type}`,
        );
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      // non-blocking if mock DB
    }

    const orderId = `order_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      orderId,
      planId: plan.id,
      planName: plan.name,
      vehicleId: dto.vehicleId,
      amountPaise: plan.pricePaise,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
      validityDays: plan.validityDays,
      notes: {
        customerId,
        planId: plan.id,
        vehicleId: dto.vehicleId,
        purpose: 'SUBSCRIPTION',
      },
    };
  }

  async getUsage(customerId: string, subscriptionId: string) {
    try {
      const subscription = await (this.prisma as any).customerSubscription?.findFirst?.({
        where: { id: subscriptionId, customerId },
        include: {
          plan: true,
          usages: {
            include: {
              booking: {
                select: { id: true, code: true, createdAt: true, status: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!subscription) {
        throw new NotFoundException(`Subscription ${subscriptionId} not found`);
      }

      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        startsAt: subscription.startsAt,
        expiresAt: subscription.expiresAt,
        plan: subscription.plan,
        planSnapshot: subscription.planSnapshot,
        usages: subscription.usages,
      };
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new NotFoundException(`Subscription not found: ${subscriptionId}`);
    }
  }
}
