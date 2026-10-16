export interface PaymentProvider {
  createOrder(
    amountPaise: number,
    receipt: string,
    notes?: Record<string, string>,
  ): Promise<{ orderId: string; amount: number; keyId: string }>;
  verifySignature(orderId: string, paymentId: string, signature: string): boolean;
  verifyWebhookSignature(body: string, signature: string): boolean;
  createRefund(paymentId: string, amountPaise: number): Promise<{ refundId: string; status: string }>;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');
