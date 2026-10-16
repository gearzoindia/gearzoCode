import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { UpdateDispatchSettingsDto } from './dto';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getSettings() {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'dispatch.algorithm_settings' },
    });

    return (
      setting?.value || {
        scoringWeights: {
          distanceWeight: 0.4,
          ratingWeight: 0.3,
          idleTimeWeight: 0.2,
          completionRateWeight: 0.1,
        },
        waveConfiguration: [
          { wave: 1, radiusKm: 3, timeoutSec: 30, maxCandidates: 3 },
          { wave: 2, radiusKm: 7, timeoutSec: 45, maxCandidates: 6 },
          { wave: 3, radiusKm: 15, timeoutSec: 60, maxCandidates: 10 },
        ],
      }
    );
  }

  async updateSettings(dto: UpdateDispatchSettingsDto, adminId: string) {
    const updated = await this.prisma.systemSetting.upsert({
      where: { key: 'dispatch.algorithm_settings' },
      create: {
        key: 'dispatch.algorithm_settings',
        value: {
          scoringWeights: dto.scoringWeights,
          waveConfiguration: dto.waveConfiguration,
        },
        updatedById: adminId,
      },
      update: {
        value: {
          scoringWeights: dto.scoringWeights,
          waveConfiguration: dto.waveConfiguration,
        },
        updatedById: adminId,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'DISPATCH_SETTINGS_UPDATE',
      entity: 'SystemSetting',
      entityId: updated.id,
      after: dto,
      reason: 'Modified automated booking dispatch engine tuning weights and waves',
    });

    return updated.value;
  }
}
