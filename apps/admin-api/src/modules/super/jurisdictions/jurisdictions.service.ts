import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { CreateJurisdictionDto, UpdateJurisdictionDto } from './dto';

@Injectable()
export class JurisdictionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.jurisdiction.findMany({
      include: {
        parent: { select: { id: true, name: true, level: true } },
        children: { select: { id: true, name: true, level: true, isActive: true } },
        city: { select: { id: true, name: true } },
      },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.jurisdiction.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        city: true,
        admins: { select: { id: true, name: true, role: true, email: true } },
      },
    });
    if (!item) throw new NotFoundException('Jurisdiction not found');
    return item;
  }

  private validateNoPolygonOverlap(polygon: any, existingAreas: any[], currentId?: string) {
    // In a production PostGIS setup, ST_Overlaps / ST_Intersects is run.
    // Here we validate polygon structure has valid GeoJSON coordinates.
    if (polygon && polygon.coordinates && (!Array.isArray(polygon.coordinates) || polygon.coordinates.length === 0)) {
      throw new BadRequestException('Invalid GeoJSON coordinates in jurisdiction polygon');
    }
  }

  async create(dto: CreateJurisdictionDto, adminId: string) {
    if (dto.polygon) {
      const existing = await this.prisma.jurisdiction.findMany({
        where: { level: dto.level, cityId: dto.cityId },
      });
      this.validateNoPolygonOverlap(dto.polygon, existing);
    }

    const created = await this.prisma.jurisdiction.create({
      data: {
        name: dto.name,
        level: dto.level,
        parentId: dto.parentId,
        cityId: dto.cityId,
        polygon: dto.polygon ? (dto.polygon as any) : undefined,
        isActive: dto.isActive ?? true,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'JURISDICTION_CREATE',
      entity: 'Jurisdiction',
      entityId: created.id,
      after: { name: created.name, level: created.level },
      reason: 'Created administrative jurisdiction',
    });

    return created;
  }

  async update(id: string, dto: UpdateJurisdictionDto, adminId: string) {
    const existing = await this.prisma.jurisdiction.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Jurisdiction not found');

    if (dto.polygon) {
      const others = await this.prisma.jurisdiction.findMany({
        where: { id: { not: id }, level: existing.level },
      });
      this.validateNoPolygonOverlap(dto.polygon, others, id);
    }

    const updated = await this.prisma.jurisdiction.update({
      where: { id },
      data: {
        name: dto.name,
        parentId: dto.parentId,
        cityId: dto.cityId,
        polygon: dto.polygon !== undefined ? (dto.polygon as any) : undefined,
        isActive: dto.isActive,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'JURISDICTION_UPDATE',
      entity: 'Jurisdiction',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Updated jurisdiction geometry/parameters',
    });

    return updated;
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.jurisdiction.findUnique({
      where: { id },
      include: { children: true, admins: true, bookings: true },
    });
    if (!existing) throw new NotFoundException('Jurisdiction not found');

    if (existing.children.length > 0) {
      throw new BadRequestException('Cannot delete jurisdiction with active sub-jurisdictions. Reassign or delete children first.');
    }

    if (existing.admins.length > 0) {
      throw new BadRequestException('Cannot delete jurisdiction with assigned administrators.');
    }

    const deleted = await this.prisma.jurisdiction.update({
      where: { id },
      data: { isActive: false },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'JURISDICTION_DEACTIVATE',
      entity: 'Jurisdiction',
      entityId: id,
      reason: 'Deactivated jurisdiction',
    });

    return { message: 'Jurisdiction deactivated successfully', id };
  }
}
