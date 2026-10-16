import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { SetMaintenanceDto } from './dto/set-maintenance.dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Maintenance')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @Permissions('MAINTENANCE_MODE')
  @ApiOperation({ summary: 'Get current system maintenance mode state' })
  async getStatus() {
    return this.maintenanceService.getStatus();
  }

  @Post()
  @Permissions('MAINTENANCE_MODE')
  @ApiOperation({ summary: 'Activate or deactivate maintenance mode across specific mobile/web apps' })
  async setMaintenance(
    @Body() dto: SetMaintenanceDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.maintenanceService.setMaintenance(dto, adminId);
  }
}
