import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { SetMaintenanceDto } from './dto/set-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getStatus() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'system.maintenance_mode' },
    });

    return (
      setting?.value || {
        enabled: false,
        message: 'System fully operational',
        apps: [],
      }
    );
  }

  async setMaintenance(dto: SetMaintenanceDto, adminId: string) {
    const setting = await this.prisma.systemSetting.upsert({
      where: { key: 'system.maintenance_mode' },
      create: {
        key: 'system.maintenance_mode',
        value: {
          enabled: dto.enabled,
          message: dto.message,
          eta: dto.eta,
          apps: dto.apps,
          updatedAt: new Date().toISOString(),
        },
        updatedById: adminId,
      },
      update: {
        value: {
          enabled: dto.enabled,
          message: dto.message,
          eta: dto.eta,
          apps: dto.apps,
          updatedAt: new Date().toISOString(),
        },
        updatedById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'MAINTENANCE_MODE_SET',
      entity: 'SystemSetting',
      entityId: setting.id,
      after: dto,
      reason: `Maintenance mode ${dto.enabled ? 'activated' : 'deactivated'} for ${dto.apps.join(', ')}`,
    });

    return setting.value;
  }
}
