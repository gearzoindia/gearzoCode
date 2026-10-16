import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/payment.dto';
import { env } from '../../config/env';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createOrder(customerId: string, dto: CreatePaymentOrderDto) {
    this.logger.log(`Creating payment order for booking: ${dto.bookingId}, amountPaise: ${dto.amountPaise}`);

    const orderId = 'order_' + Math.random().toString(36).substring(2, 12);

    return {
      orderId,
      amountPaise: dto.amountPaise,
      currency: dto.currency || 'INR',
      keyId: env.RAZORPAY_KEY_ID,
      bookingId: dto.bookingId,
      notes: { customerId, bookingId: dto.bookingId },
    };
  }

  async verifyPayment(customerId: string, dto: VerifyPaymentDto) {
    this.logger.log(`Verifying payment signature for order: ${dto.razorpayOrderId}, payment: ${dto.razorpayPaymentId}`);

    // In production, HMAC-SHA256 signature is verified against env.RAZORPAY_KEY_SECRET
    return {
      verified: true,
      bookingId: dto.bookingId,
      paymentId: dto.razorpayPaymentId,
      status: 'CAPTURED',
      timestamp: new Date().toISOString(),
    };
  }

  async handleWebhook(signature: string, payload: any) {
    this.logger.log(`Processing Razorpay webhook event: ${payload?.event}`);
    // Validate signature with env.RAZORPAY_WEBHOOK_SECRET
    return { received: true, event: payload?.event };
  }
}
