import { prisma, PrismaClient } from '@gearzo/db';

export interface PaymentPolicy {
  allowCash: boolean;
  allowOnline: boolean;
  allowPartial: boolean;
  prepaidRequired: boolean;
  prepaidPercent: number;
  sourceLevel: 'SERVICE' | 'CATEGORY' | 'AREA' | 'CITY' | 'GLOBAL';
}

export const DEFAULT_PAYMENT_POLICY: PaymentPolicy = {
  allowCash: true,
  allowOnline: true,
  allowPartial: false,
  prepaidRequired: false,
  prepaidPercent: 0,
  sourceLevel: 'GLOBAL',
};

export class PaymentPolicyResolver {
  constructor(private readonly client: PrismaClient = prisma) {}

  /**
   * Resolves payment policy based on strict precedence:
   * 1. SERVICE level
   * 2. CATEGORY level
   * 3. AREA level
   * 4. CITY level
   * 5. GLOBAL system policy
   */
  async resolvePaymentPolicy(
    serviceId?: string,
    categoryId?: string,
    areaId?: string,
    cityId?: string,
  ): Promise<PaymentPolicy> {
    const policyDelegate = (this.client as any).paymentPolicy;

    if (policyDelegate?.findFirst) {
      // 1. Service Level
      if (serviceId) {
        const p = await policyDelegate.findFirst({
          where: { serviceId },
        });
        if (p) return this.mapRecord(p, 'SERVICE');
      }

      // 2. Category Level
      if (categoryId) {
        const p = await policyDelegate.findFirst({
          where: { categoryId, serviceId: null },
        });
        if (p) return this.mapRecord(p, 'CATEGORY');
      }

      // 3. Area Level
      if (areaId) {
        const p = await policyDelegate.findFirst({
          where: { areaId, serviceId: null, categoryId: null },
        });
        if (p) return this.mapRecord(p, 'AREA');
      }

      // 4. City Level
      if (cityId) {
        const p = await policyDelegate.findFirst({
          where: { cityId, areaId: null, serviceId: null, categoryId: null },
        });
        if (p) return this.mapRecord(p, 'CITY');
      }

      // 5. Global Policy in DB
      const globalPolicy = await policyDelegate.findFirst({
        where: {
          isGlobal: true,
        },
      });
      if (globalPolicy) {
        return this.mapRecord(globalPolicy, 'GLOBAL');
      }
    }

    return DEFAULT_PAYMENT_POLICY;
  }

  private mapRecord(rec: any, level: PaymentPolicy['sourceLevel']): PaymentPolicy {
    return {
      allowCash: rec.allowCash ?? DEFAULT_PAYMENT_POLICY.allowCash,
      allowOnline: rec.allowOnline ?? DEFAULT_PAYMENT_POLICY.allowOnline,
      allowPartial: rec.allowPartial ?? DEFAULT_PAYMENT_POLICY.allowPartial,
      prepaidRequired: rec.prepaidRequired ?? DEFAULT_PAYMENT_POLICY.prepaidRequired,
      prepaidPercent: rec.prepaidPercent ?? DEFAULT_PAYMENT_POLICY.prepaidPercent,
      sourceLevel: level,
    };
  }
}

export async function resolvePaymentPolicy(
  serviceId?: string,
  categoryId?: string,
  areaId?: string,
  cityId?: string,
  client: PrismaClient = prisma,
): Promise<PaymentPolicy> {
  const resolver = new PaymentPolicyResolver(client);
  return resolver.resolvePaymentPolicy(serviceId, categoryId, areaId, cityId);
}
