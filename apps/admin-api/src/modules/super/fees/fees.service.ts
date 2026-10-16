import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { SetFeeRuleDto } from './dto';

@Injectable()
export class FeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getFees() {
    return this.prisma.feeRule.findMany({
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async setFee(dto: SetFeeRuleDto, adminId: string) {
    const effectiveFrom = new Date(dto.effectiveFrom);

    const fee = await this.prisma.feeRule.create({
      data: {
        type: dto.type,
        value: dto.value,
        valueType: dto.valueType,
        cityId: dto.cityId || null,
        effectiveFrom,
        createdById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'FEE_RULE_SET',
      entity: 'FeeRule',
      entityId: fee.id,
      after: { type: dto.type, value: dto.value, valueType: dto.valueType, effectiveFrom },
      reason: 'Configured platform fee rule',
    });

    return fee;
  }
}
