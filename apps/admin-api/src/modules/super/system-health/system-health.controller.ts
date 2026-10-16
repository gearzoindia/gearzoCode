import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemHealthService } from './system-health.service';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators';

@ApiTags('Super Admin - System Health')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('system-health')
export class SystemHealthController {
  constructor(private readonly systemHealthService: SystemHealthService) {}

  @Get()
  @Permissions('SETTINGS_LIMITS_MANAGE')
  @ApiOperation({ summary: 'Real-time telemetry: OTP/SMS conversion, payment rates, errors, DB latency' })
  async getHealth() {
    return this.systemHealthService.getHealth();
  }
}
