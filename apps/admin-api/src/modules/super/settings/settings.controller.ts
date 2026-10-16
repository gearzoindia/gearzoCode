import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { SetSystemLimitDto, SetBookingRulesDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Settings & Limits')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('limits')
  @Permissions('SETTINGS_LIMITS_MANAGE')
  @ApiOperation({ summary: 'Get security limits and session thresholds' })
  async getLimits() {
    return this.settingsService.getLimits();
  }

  @Put('limits')
  @Permissions('SETTINGS_LIMITS_MANAGE')
  @ApiOperation({ summary: 'Update or set custom security limit override' })
  async setLimit(
    @Body() dto: SetSystemLimitDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.settingsService.setLimit(dto, adminId);
  }

  @Delete('limits')
  @Permissions('SETTINGS_LIMITS_MANAGE')
  @ApiOperation({ summary: 'Delete custom override to restore code default' })
  async deleteLimit(
    @Query('key') key: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.settingsService.deleteLimit(key, adminId);
  }

  @Get('limits/history')
  @Permissions('SETTINGS_LIMITS_MANAGE')
  @ApiOperation({ summary: 'Get security limit change history audit trail' })
  async getLimitsHistory() {
    return this.settingsService.getLimitsHistory();
  }

  @Get('booking-rules')
  @Permissions('SETTINGS_LIMITS_MANAGE')
  @ApiOperation({ summary: 'Get booking lead times and operational rules' })
  async getBookingRules() {
    return this.settingsService.getBookingRules();
  }

  @Put('booking-rules')
  @Permissions('SETTINGS_LIMITS_MANAGE')
  @ApiOperation({ summary: 'Update booking operational rules' })
  async setBookingRules(
    @Body() dto: SetBookingRulesDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.settingsService.setBookingRules(dto, adminId);
  }
}
