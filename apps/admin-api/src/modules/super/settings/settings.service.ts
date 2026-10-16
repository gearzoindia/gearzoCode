import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { SetSystemLimitDto, SetBookingRulesDto } from './dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getLimits() {
    return this.prisma.systemSetting.findMany({
      where: {
        OR: [{ key: { startsWith: 'limit.' } }, { key: { startsWith: 'session.' } }],
      },
    });
  }

  async setLimit(dto: SetSystemLimitDto, adminId: string) {
    const existing = await this.prisma.systemSetting.findUnique({
      where: { key: dto.key },
    });

    const updated = await this.prisma.systemSetting.upsert({
      where: { key: dto.key },
      create: {
        key: dto.key,
        value: dto.value,
        updatedById: adminId,
      },
      update: {
        value: dto.value,
        updatedById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'SETTINGS_LIMIT_SET',
      entity: 'SystemSetting',
      entityId: updated.id,
      before: existing ? { value: existing.value } : null,
      after: { value: dto.value },
      reason: dto.reason || 'System security limit adjusted',
    });

    return updated;
  }

  async deleteLimit(key: string, adminId: string) {
    const existing = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!existing) throw new NotFoundException('Setting key not found');

    await this.prisma.systemSetting.delete({ where: { key } });

    await this.audit.log({
      actorId: adminId,
      action: 'SETTINGS_LIMIT_DELETE',
      entity: 'SystemSetting',
      entityId: existing.id,
      before: { value: existing.value },
      reason: 'Deleted custom override, returned to code default',
    });

    return { message: 'Setting deleted successfully', key };
  }

  async getLimitsHistory() {
    return this.prisma.auditLog.findMany({
      where: {
        entity: 'SystemSetting',
        action: { in: ['SETTINGS_LIMIT_SET', 'SETTINGS_LIMIT_DELETE'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getBookingRules() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'settings.booking_rules' },
    });

    return (
      setting?.value || {
        leadTimeMinutes: 30,
        maxAdvanceDays: 14,
        cancellationGraceMinutes: 5,
        mechanicArrivalBufferMinutes: 15,
      }
    );
  }

  async setBookingRules(dto: SetBookingRulesDto, adminId: string) {
    const updated = await this.prisma.systemSetting.upsert({
      where: { key: 'settings.booking_rules' },
      create: {
        key: 'settings.booking_rules',
        value: dto.rules,
        updatedById: adminId,
      },
      update: {
        value: dto.rules,
        updatedById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'BOOKING_RULES_UPDATE',
      entity: 'SystemSetting',
      entityId: updated.id,
      after: { rules: dto.rules },
      reason: 'Updated booking operational dispatch rules',
    });

    return updated;
  }
}
