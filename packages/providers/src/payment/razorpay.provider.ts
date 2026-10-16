import { Injectable, Logger } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'node:crypto';
import { PaymentProvider } from './payment.provider';

@Injectable()
export class RazorpayPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(RazorpayPaymentProvider.name);
  private readonly razorpay: Razorpay;
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    if (!this.keyId || !this.keySecret) {
      this.logger.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured');
    }

    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  async createOrder(
    amountPaise: number,
    receipt: string,
    notes?: Record<string, string>,
  ): Promise<{ orderId: string; amount: number; keyId: string }> {
    try {
      const order = await this.razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: notes ?? {},
      });

      return {
        orderId: order.id,
        amount: Number(order.amount),
        keyId: this.keyId,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create Razorpay order for receipt "${receipt}": ${message}`);
      throw error;
    }
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!this.keySecret) {
      this.logger.error('Cannot verify Razorpay signature: RAZORPAY_KEY_SECRET is not configured');
      return false;
    }

    try {
      const payload = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(payload)
        .digest('hex');

      return (
        expectedSignature.length === signature.length &&
        crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf8'),
          Buffer.from(signature, 'utf8'),
        )
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error verifying Razorpay payment signature: ${message}`);
      return false;
    }
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.error('Cannot verify Razorpay webhook signature: RAZORPAY_WEBHOOK_SECRET is not configured');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(body)
        .digest('hex');

      return (
        expectedSignature.length === signature.length &&
        crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf8'),
          Buffer.from(signature, 'utf8'),
        )
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error verifying Razorpay webhook signature: ${message}`);
      return false;
    }
  }

  async createRefund(
    paymentId: string,
    amountPaise: number,
  ): Promise<{ refundId: string; status: string }> {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amountPaise,
      });

      return {
        refundId: refund.id,
        status: refund.status || 'processed',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to refund Razorpay payment "${paymentId}": ${message}`);
      throw error;
    }
  }
}
