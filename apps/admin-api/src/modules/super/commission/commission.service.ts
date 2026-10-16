import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { SetCommissionRuleDto } from './dto';

@Injectable()
export class CommissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getRules() {
    return this.prisma.commissionRule.findMany({
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async setRule(dto: SetCommissionRuleDto, adminId: string) {
    const effectiveFrom = new Date(dto.effectiveFrom);

    const rule = await this.prisma.commissionRule.create({
      data: {
        scope: dto.scope,
        scopeId: dto.scopeId || null,
        percent: dto.percent,
        effectiveFrom,
        createdById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'COMMISSION_RULE_SET',
      entity: 'CommissionRule',
      entityId: rule.id,
      after: { scope: dto.scope, percent: dto.percent, effectiveFrom },
      reason: 'Created new commission policy rule',
    });

    return rule;
  }
}
