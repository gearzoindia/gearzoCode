import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from './dto';

@Injectable()
export class FeatureFlagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async findOne(id: string) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!flag) throw new NotFoundException('Feature flag not found');
    return flag;
  }

  async create(dto: CreateFeatureFlagDto, adminId: string) {
    const flag = await this.prisma.featureFlag.create({
      data: {
        key: dto.key,
        enabled: dto.enabled ?? false,
        rules: dto.rules || {},
        updatedById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'FEATURE_FLAG_CREATE',
      entity: 'FeatureFlag',
      entityId: flag.id,
      after: flag,
      reason: 'Created new feature flag',
    });

    return flag;
  }

  async update(id: string, dto: UpdateFeatureFlagDto, adminId: string) {
    const existing = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Feature flag not found');

    const updated = await this.prisma.featureFlag.update({
      where: { id },
      data: {
        enabled: dto.enabled,
        rules: dto.rules !== undefined ? dto.rules : undefined,
        updatedById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'FEATURE_FLAG_UPDATE',
      entity: 'FeatureFlag',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Updated feature flag status or rollout rules',
    });

    return updated;
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Feature flag not found');

    await this.prisma.featureFlag.delete({ where: { id } });

    await this.audit.log({
      actorId: adminId,
      action: 'FEATURE_FLAG_DELETE',
      entity: 'FeatureFlag',
      entityId: id,
      before: existing,
      reason: 'Deleted feature flag',
    });

    return { message: 'Feature flag deleted successfully', id };
  }
}
