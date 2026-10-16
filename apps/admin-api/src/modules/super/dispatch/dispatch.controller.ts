import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DispatchService } from './dispatch.service';
import { UpdateDispatchSettingsDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Dispatch')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('dispatch-settings')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get()
  @Permissions('DISPATCH_SETTINGS_MANAGE')
  @ApiOperation({ summary: 'Get automated dispatch algorithm weights, waves, and radius steps' })
  async getSettings() {
    return this.dispatchService.getSettings();
  }

  @Put()
  @Permissions('DISPATCH_SETTINGS_MANAGE')
  @ApiOperation({ summary: 'Update dispatch scoring weights and wave expansion parameters' })
  async updateSettings(
    @Body() dto: UpdateDispatchSettingsDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.dispatchService.updateSettings(dto, adminId);
  }
}
