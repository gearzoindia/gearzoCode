import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import {
  QueryPricingMatrixDto,
  SetPricingEntryDto,
  BulkSetPricingDto,
  ImportPricingCsvDto,
} from './dto';
import { Prisma, VehicleType } from '@gearzo/db';

@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getPricing(dto: QueryPricingMatrixDto) {
    const where: Prisma.ServicePriceWhereInput = {};
    if (dto.serviceId) where.serviceId = dto.serviceId;
    if (dto.vehicleType) where.vehicleType = dto.vehicleType;
    if (dto.modelId) where.modelId = dto.modelId;
    if (dto.areaId) where.areaId = dto.areaId;

    return this.prisma.servicePrice.findMany({
      where,
      include: {
        service: { select: { id: true, name: true, priceType: true } },
        model: { select: { id: true, name: true, brand: { select: { name: true } } } },
        area: { select: { id: true, name: true } },
      },
      take: 200,
    });
  }

  async upsertPrice(dto: SetPricingEntryDto, adminId: string) {
    const existing = await this.prisma.servicePrice.findFirst({
      where: {
        serviceId: dto.serviceId,
        vehicleType: dto.vehicleType,
        modelId: dto.modelId || null,
        areaId: dto.areaId || null,
      },
    });

    let result;
    if (existing) {
      result = await this.prisma.servicePrice.update({
        where: { id: existing.id },
        data: { pricePaise: dto.pricePaise },
      });
    } else {
      result = await this.prisma.servicePrice.create({
        data: {
          serviceId: dto.serviceId,
          vehicleType: dto.vehicleType,
          modelId: dto.modelId || null,
          areaId: dto.areaId || null,
          pricePaise: dto.pricePaise,
        },
      });
    }

    await this.audit.log({
      actorId: adminId,
      action: 'PRICING_UPDATE',
      entity: 'ServicePrice',
      entityId: result.id,
      before: existing ? { pricePaise: existing.pricePaise } : null,
      after: { pricePaise: dto.pricePaise },
      reason: 'Pricing matrix tier updated',
    });

    return result;
  }

  async bulkUpsert(dto: BulkSetPricingDto, adminId: string) {
    const results = [];
    for (const entry of dto.entries) {
      const res = await this.upsertPrice(entry, adminId);
      results.push(res);
    }
    return { count: results.length, message: 'Pricing matrix updated successfully' };
  }

  async importCsv(dto: ImportPricingCsvDto, dryRun: boolean, adminId: string) {
    const lines = dto.csvContent.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new BadRequestException('CSV file must include header row and at least one data row');
    }

    const header = lines[0].split(',').map((h) => h.trim());
    const validRows: SetPricingEntryDto[] = [];
    const errors: Array<{ row: number; reason: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map((c) => c.trim());

      const [serviceId, vehicleTypeStr, modelId, areaId, pricePaiseStr] = cols;
      const pricePaise = parseInt(pricePaiseStr, 10);

      if (!serviceId || isNaN(pricePaise)) {
        errors.push({ row: i, reason: 'Invalid serviceId or pricePaise' });
        continue;
      }

      validRows.push({
        serviceId,
        vehicleType: (vehicleTypeStr as VehicleType) || VehicleType.TWO_WHEELER,
        modelId: modelId || undefined,
        areaId: areaId || undefined,
        pricePaise,
      });
    }

    if (dryRun) {
      return {
        dryRun: true,
        totalRows: lines.length - 1,
        validCount: validRows.length,
        errorCount: errors.length,
        errors,
      };
    }

    // Apply import
    for (const row of validRows) {
      await this.upsertPrice(row, adminId);
    }

    await this.audit.log({
      actorId: adminId,
      action: 'PRICING_CSV_IMPORT',
      entity: 'ServicePrice',
      after: { importedCount: validRows.length },
      reason: 'Bulk pricing CSV matrix imported',
    });

    return {
      dryRun: false,
      importedCount: validRows.length,
      errors,
      message: `Successfully imported ${validRows.length} pricing rows`,
    };
  }

  async getPriceHistory(serviceId?: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entity: 'ServicePrice',
        action: 'PRICING_UPDATE',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
