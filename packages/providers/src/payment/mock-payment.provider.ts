import { Injectable, Logger } from '@nestjs/common';
import { PaymentProvider } from './payment.provider';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  private readonly logger = new Logger(MockPaymentProvider.name);

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowInProd = process.env.ALLOW_MOCK_PAYMENT_IN_PROD === 'true';

    if (isProduction && !allowInProd) {
      throw new Error(
        'MockPaymentProvider cannot be instantiated in production without ALLOW_MOCK_PAYMENT_IN_PROD=true',
      );
    }

    this.logger.warn('MockPaymentProvider initialized: All payments will be simulated');
  }

  async createOrder(
    amountPaise: number,
    receipt: string,
    _notes?: Record<string, string>,
  ): Promise<{ orderId: string; amount: number; keyId: string }> {
    const orderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.logger.warn(
      `Mock payment order created: orderId=${orderId}, amount=${amountPaise} paise, receipt=${receipt}`,
    );

    return {
      orderId,
      amount: amountPaise,
      keyId: 'rzp_test_mock_key_id',
    };
  }

  verifySignature(_orderId: string, _paymentId: string, _signature: string): boolean {
    this.logger.warn('Mock payment signature verification invoked (always returns true)');
    return true;
  }

  verifyWebhookSignature(_body: string, _signature: string): boolean {
    this.logger.warn('Mock payment webhook signature verification invoked (always returns true)');
    return true;
  }

  async createRefund(
    paymentId: string,
    amountPaise: number,
  ): Promise<{ refundId: string; status: string }> {
    const refundId = `rfnd_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.logger.warn(
      `Mock payment refund created: refundId=${refundId}, paymentId=${paymentId}, amount=${amountPaise} paise`,
    );

    return {
      refundId,
      status: 'processed',
    };
  }
}
