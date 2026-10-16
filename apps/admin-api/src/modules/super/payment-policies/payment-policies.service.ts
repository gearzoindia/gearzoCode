import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { CreatePaymentPolicyDto, UpdatePaymentPolicyDto } from './dto';

@Injectable()
export class PaymentPoliciesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.paymentPolicyConfig.findMany({
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async findOne(id: string) {
    const policy = await this.prisma.paymentPolicyConfig.findUnique({ where: { id } });
    if (!policy) throw new NotFoundException('Payment policy not found');
    return policy;
  }

  async create(dto: CreatePaymentPolicyDto, adminId: string) {
    const policy = await this.prisma.paymentPolicyConfig.create({
      data: {
        scope: dto.scope,
        scopeId: dto.scopeId || null,
        policy: dto.policy,
        advanceType: dto.advanceType,
        advanceValue: dto.advanceValue,
        effectiveFrom: new Date(dto.effectiveFrom),
        createdById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'PAYMENT_POLICY_CREATE',
      entity: 'PaymentPolicyConfig',
      entityId: policy.id,
      after: policy,
      reason: 'Configured new payment timing and advance policy',
    });

    return policy;
  }

  async update(id: string, dto: UpdatePaymentPolicyDto, adminId: string) {
    const existing = await this.prisma.paymentPolicyConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Payment policy not found');

    const updated = await this.prisma.paymentPolicyConfig.update({
      where: { id },
      data: {
        policy: dto.policy,
        advanceType: dto.advanceType,
        advanceValue: dto.advanceValue,
        effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : undefined,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'PAYMENT_POLICY_UPDATE',
      entity: 'PaymentPolicyConfig',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Modified payment policy rules',
    });

    return updated;
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.paymentPolicyConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Payment policy not found');

    await this.prisma.paymentPolicyConfig.delete({ where: { id } });

    await this.audit.log({
      actorId: adminId,
      action: 'PAYMENT_POLICY_DELETE',
      entity: 'PaymentPolicyConfig',
      entityId: id,
      reason: 'Deleted payment policy override',
    });

    return { message: 'Payment policy deleted', id };
  }
}
