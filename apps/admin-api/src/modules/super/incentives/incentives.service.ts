import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { CreateIncentiveRuleDto, UpdateIncentiveRuleDto } from './dto';

@Injectable()
export class IncentivesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.incentiveRule.findMany({
      orderBy: { startsAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.incentiveRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Incentive rule not found');
    return rule;
  }

  async create(dto: CreateIncentiveRuleDto, adminId: string) {
    const rule = await this.prisma.incentiveRule.create({
      data: {
        name: dto.name,
        type: dto.type,
        params: dto.params,
        scope: dto.scope,
        scopeId: dto.scopeId || null,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        isActive: dto.isActive ?? true,
        createdById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'INCENTIVE_RULE_CREATE',
      entity: 'IncentiveRule',
      entityId: rule.id,
      after: rule,
      reason: 'Created mechanic incentive program',
    });

    return rule;
  }

  async update(id: string, dto: UpdateIncentiveRuleDto, adminId: string) {
    const existing = await this.prisma.incentiveRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Incentive rule not found');

    const updated = await this.prisma.incentiveRule.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        params: dto.params,
        scope: dto.scope,
        scopeId: dto.scopeId,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        isActive: dto.isActive,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'INCENTIVE_RULE_UPDATE',
      entity: 'IncentiveRule',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Modified incentive program parameters',
    });

    return updated;
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.incentiveRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Incentive rule not found');

    const updated = await this.prisma.incentiveRule.update({
      where: { id },
      data: { isActive: false },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'INCENTIVE_RULE_DEACTIVATE',
      entity: 'IncentiveRule',
      entityId: id,
      reason: 'Deactivated mechanic incentive program',
    });

    return { message: 'Incentive rule deactivated', id };
  }
}
