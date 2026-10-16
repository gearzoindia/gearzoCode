import { prisma, PrismaClient } from '@gearzo/db';

export interface QuoteItemInput {
  serviceId: string;
  serviceName: string;
  pricePaise: number;
  quantity?: number;
}

export interface QuoteItemBreakdown {
  serviceId: string;
  serviceName: string;
  unitPricePaise: number;
  quantity: number;
  totalPaise: number;
}

export interface FeesInput {
  visitFeePaise?: number;
  platformFeePaise?: number;
  taxRatePercent?: number; // e.g. 18 for 18% GST
}

export interface QuoteBreakdown {
  items: QuoteItemBreakdown[];
  subtotalPaise: number;
  discountPaise: number;
  visitFeePaise: number;
  platformFeePaise: number;
  taxPaise: number;
  totalPaise: number;
}

export class PricingService {
  constructor(private readonly client: PrismaClient = prisma) {}

  /**
   * Resolves service price with hierarchical fallback:
   * 1. Area + Model override
   * 2. Model override
   * 3. Area + VehicleType override
   * 4. VehicleType base price
   */
  async resolveServicePrice(
    serviceId: string,
    vehicleType: string,
    modelId?: string,
    areaId?: string,
  ): Promise<number> {
    const pricingDelegate = (this.client as any).servicePricing;
    const serviceDelegate = (this.client as any).service;

    if (pricingDelegate?.findFirst) {
      // 1. Area + Model override
      if (areaId && modelId) {
        const areaModelPrice = await pricingDelegate.findFirst({
          where: { serviceId, areaId, modelId },
        });
        if (areaModelPrice) return areaModelPrice.pricePaise;
      }

      // 2. Model override
      if (modelId) {
        const modelPrice = await pricingDelegate.findFirst({
          where: { serviceId, modelId, areaId: null },
        });
        if (modelPrice) return modelPrice.pricePaise;
      }

      // 3. Area + VehicleType override
      if (areaId) {
        const areaTypePrice = await pricingDelegate.findFirst({
          where: { serviceId, vehicleType, areaId, modelId: null },
        });
        if (areaTypePrice) return areaTypePrice.pricePaise;
      }

      // 4. VehicleType base price
      const baseTypePrice = await pricingDelegate.findFirst({
        where: { serviceId, vehicleType, areaId: null, modelId: null },
      });
      if (baseTypePrice) return baseTypePrice.pricePaise;
    }

    // Direct fallback from Service catalog base price
    if (serviceDelegate?.findUnique) {
      const service = await serviceDelegate.findUnique({
        where: { id: serviceId },
        select: { basePricePaise: true },
      });
      if (service?.basePricePaise !== undefined) {
        return service.basePricePaise;
      }
    }

    return 0;
  }

  /**
   * Calculates detailed price quote breakdown in paise (integers).
   */
  calculateQuote(
    items: QuoteItemInput[],
    discountPaise: number = 0,
    fees: FeesInput = {},
  ): QuoteBreakdown {
    const itemBreakdowns: QuoteItemBreakdown[] = items.map((item) => {
      const qty = Math.max(1, item.quantity ?? 1);
      const total = Math.round(item.pricePaise * qty);
      return {
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        unitPricePaise: Math.round(item.pricePaise),
        quantity: qty,
        totalPaise: total,
      };
    });

    const subtotalPaise = itemBreakdowns.reduce((acc, curr) => acc + curr.totalPaise, 0);
    const clampedDiscountPaise = Math.min(Math.max(0, Math.round(discountPaise)), subtotalPaise);

    const visitFeePaise = Math.max(0, Math.round(fees.visitFeePaise ?? 0));
    const platformFeePaise = Math.max(0, Math.round(fees.platformFeePaise ?? 0));

    // Taxable amount = (Subtotal - Discount) + Platform Fee (and/or visit fee depending on policy)
    const taxableBase = Math.max(0, subtotalPaise - clampedDiscountPaise + platformFeePaise);
    const taxRate = fees.taxRatePercent ?? 18; // Default 18% GST
    const taxPaise = Math.round((taxableBase * taxRate) / 100);

    const totalPaise = Math.max(
      0,
      subtotalPaise - clampedDiscountPaise + visitFeePaise + platformFeePaise + taxPaise,
    );

    return {
      items: itemBreakdowns,
      subtotalPaise,
      discountPaise: clampedDiscountPaise,
      visitFeePaise,
      platformFeePaise,
      taxPaise,
      totalPaise,
    };
  }
}
