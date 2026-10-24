import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  CreateServiceDto,
  UpdateServiceDto,
} from './dto';

@Injectable()
export class CatalogueService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ================= CATEGORIES =================
  async findAllCategories() {
    return this.prisma.serviceCategory.findMany({
      include: {
        _count: { select: { services: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findCategory(id: string) {
    const cat = await this.prisma.serviceCategory.findUnique({
      where: { id },
      include: { services: true },
    });
    if (!cat) throw new NotFoundException('Service category not found');
    return cat;
  }

  async createCategory(dto: CreateServiceCategoryDto, adminId: string) {
    const created = await this.prisma.serviceCategory.create({
      data: {
        name: dto.name,
        icon: dto.icon,
        sortOrder: dto.sortOrder ?? 0,
        isEmergency: dto.isEmergency ?? false,
        isActive: dto.isActive ?? true,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'SERVICE_CATEGORY_CREATE',
      entity: 'ServiceCategory',
      entityId: created.id,
      after: created,
      reason: 'Created service category',
    });

    return created;
  }

  async updateCategory(id: string, dto: UpdateServiceCategoryDto, adminId: string) {
    const existing = await this.prisma.serviceCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service category not found');

    const updated = await this.prisma.serviceCategory.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      actorId: adminId,
      action: 'SERVICE_CATEGORY_UPDATE',
      entity: 'ServiceCategory',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Updated service category',
    });

    return updated;
  }

  async removeCategory(id: string, adminId: string) {
    const existing = await this.prisma.serviceCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service category not found');

    const updated = await this.prisma.serviceCategory.update({
      where: { id },
      data: { isActive: false },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'SERVICE_CATEGORY_DEACTIVATE',
      entity: 'ServiceCategory',
      entityId: id,
      reason: 'Deactivated service category',
    });

    return { message: 'Category deactivated successfully', id };
  }

  // ================= SERVICES =================
  async findAllServices() {
    const list = await this.prisma.services.findMany({
      include: {
        category: { select: { id: true, name: true } },
        servicePrices: { take: 5 },
      },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    });

    return list.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      status: s.isActive ? 'ACTIVE' : 'INACTIVE',
      durationMinutes: s.durationMin,
      vehicleTypes: s.vehicleTypes,
      basePricePaise: s.servicePrices[0]?.pricePaise ?? 0,
      category: s.category?.name ?? 'General',
    }));
  }

  async findService(id: string) {
    const s = await this.prisma.services.findUnique({
      where: { id },
      include: { category: true, packageItems: true, servicePrices: true },
    });
    if (!s) throw new NotFoundException('Service not found');
    return s;
  }

  async createService(dto: any, adminId: string) {
    const MODE_MAP: Record<string, string> = {
      DOORSTEP: 'DOORSTEP',
      ROADSIDE: 'TOWING',
      WORKSHOP: 'GARAGE_VISIT',
      GARAGE: 'GARAGE_VISIT',
      GARAGE_VISIT: 'GARAGE_VISIT',
      PICKUP_DROP: 'PICKUP_DROP',
      TOWING: 'TOWING',
    };
    const mappedModes = Array.from(
      new Set(
        (Array.isArray(dto.allowedModes) ? dto.allowedModes : ['DOORSTEP'])
          .map((m: string) => MODE_MAP[m] || 'DOORSTEP')
      )
    );

    const created = await this.prisma.services.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description || '',
        includes: dto.includes || [],
        excludes: dto.excludes || [],
        durationMin: Number(dto.durationMin) || 30,
        priceType: dto.priceType || 'FIXED',
        vehicleTypes: dto.vehicleTypes || ['TWO_WHEELER'],
        allowedModes: mappedModes as any,
        isPackage: dto.isPackage ?? false,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    if (dto.basePricePaise || dto.price) {
      const pricePaise = dto.basePricePaise || Math.round(Number(dto.price) * 100);
      for (const vt of created.vehicleTypes) {
        await this.prisma.servicePrice.create({
          data: {
            serviceId: created.id,
            vehicleType: vt,
            pricePaise,
          },
        });
      }
    }

    try {
      await this.audit.log({
        actorId: adminId || 'admin',
        action: 'SERVICE_CREATE',
        entity: 'Services',
        entityId: created.id,
        after: created,
        reason: 'Created catalog service',
      });
    } catch {
      // audit log fallback
    }

    return created;
  }

  async updateService(id: string, dto: UpdateServiceDto, adminId: string) {
    const existing = await this.prisma.services.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');

    const updated = await this.prisma.services.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      actorId: adminId,
      action: 'SERVICE_UPDATE',
      entity: 'Services',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Updated catalog service properties',
    });

    return updated;
  }

  async removeService(id: string, adminId: string) {
    const existing = await this.prisma.services.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Service not found');

    const updated = await this.prisma.services.update({
      where: { id },
      data: { isActive: false },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'SERVICE_DEACTIVATE',
      entity: 'Services',
      entityId: id,
      reason: 'Deactivated catalog service',
    });

    return { message: 'Service deactivated successfully', id };
  }
}
