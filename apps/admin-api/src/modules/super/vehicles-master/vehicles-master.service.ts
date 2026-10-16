import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import {
  CreateVehicleBrandDto,
  UpdateVehicleBrandDto,
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
  MergeCustomModelDto,
} from './dto';

@Injectable()
export class VehiclesMasterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Brands
  async findAllBrands() {
    return this.prisma.vehicleBrand.findMany({
      include: {
        _count: { select: { models: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findBrand(id: string) {
    const brand = await this.prisma.vehicleBrand.findUnique({
      where: { id },
      include: { models: true },
    });
    if (!brand) throw new NotFoundException('Vehicle brand not found');
    return brand;
  }

  async createBrand(dto: CreateVehicleBrandDto, adminId: string) {
    const brand = await this.prisma.vehicleBrand.create({
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        types: dto.types,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'VEHICLE_BRAND_CREATE',
      entity: 'VehicleBrand',
      entityId: brand.id,
      after: brand,
      reason: 'Created vehicle brand',
    });

    return brand;
  }

  async updateBrand(id: string, dto: UpdateVehicleBrandDto, adminId: string) {
    const existing = await this.prisma.vehicleBrand.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Brand not found');

    const updated = await this.prisma.vehicleBrand.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      actorId: adminId,
      action: 'VEHICLE_BRAND_UPDATE',
      entity: 'VehicleBrand',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Updated vehicle brand',
    });

    return updated;
  }

  async removeBrand(id: string, adminId: string) {
    const brand = await this.prisma.vehicleBrand.update({
      where: { id },
      data: { isActive: false },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'VEHICLE_BRAND_DEACTIVATE',
      entity: 'VehicleBrand',
      entityId: id,
      reason: 'Deactivated vehicle brand',
    });

    return { message: 'Brand deactivated', id };
  }

  // Models
  async findAllModels(brandId?: string) {
    return this.prisma.vehicleModel.findMany({
      where: brandId ? { brandId } : undefined,
      include: { brand: { select: { id: true, name: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findModel(id: string) {
    const model = await this.prisma.vehicleModel.findUnique({
      where: { id },
      include: { brand: true, servicePrices: true },
    });
    if (!model) throw new NotFoundException('Vehicle model not found');
    return model;
  }

  async createModel(dto: CreateVehicleModelDto, adminId: string) {
    const model = await this.prisma.vehicleModel.create({
      data: {
        brandId: dto.brandId,
        name: dto.name,
        type: dto.type,
        fuelTypes: dto.fuelTypes,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'VEHICLE_MODEL_CREATE',
      entity: 'VehicleModel',
      entityId: model.id,
      after: model,
      reason: 'Created vehicle model',
    });

    return model;
  }

  async updateModel(id: string, dto: UpdateVehicleModelDto, adminId: string) {
    const existing = await this.prisma.vehicleModel.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Model not found');

    const updated = await this.prisma.vehicleModel.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      actorId: adminId,
      action: 'VEHICLE_MODEL_UPDATE',
      entity: 'VehicleModel',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Updated vehicle model',
    });

    return updated;
  }

  async removeModel(id: string, adminId: string) {
    const model = await this.prisma.vehicleModel.update({
      where: { id },
      data: { isActive: false },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'VEHICLE_MODEL_DEACTIVATE',
      entity: 'VehicleModel',
      entityId: id,
      reason: 'Deactivated vehicle model',
    });

    return { message: 'Model deactivated', id };
  }

  // Pending Custom Models
  async getPendingModels() {
    const customVehicles = await this.prisma.customerVehicle.findMany({
      where: {
        customModel: { not: null },
        modelId: null,
      },
      select: {
        id: true,
        customModel: true,
        type: true,
        brand: { select: { id: true, name: true } },
        fuelType: true,
        createdAt: true,
      },
      take: 100,
    });

    return customVehicles;
  }

  async mergeCustomModel(dto: MergeCustomModelDto, adminId: string) {
    const targetModel = await this.prisma.vehicleModel.findUnique({
      where: { id: dto.targetModelId },
    });
    if (!targetModel) throw new NotFoundException('Target vehicle model not found');

    const updated = await this.prisma.customerVehicle.updateMany({
      where: {
        customModel: { equals: dto.customModelName, mode: 'insensitive' },
        modelId: null,
      },
      data: {
        modelId: dto.targetModelId,
        customModel: null,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'VEHICLE_MODEL_MERGE',
      entity: 'VehicleModel',
      entityId: dto.targetModelId,
      after: { customModelName: dto.customModelName, updatedCount: updated.count },
      reason: 'Merged customer other models into official master record',
    });

    return {
      updatedCount: updated.count,
      targetModel: targetModel.name,
      message: `Merged ${updated.count} customer vehicles into ${targetModel.name}`,
    };
  }
}
