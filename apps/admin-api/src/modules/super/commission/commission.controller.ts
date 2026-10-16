import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommissionService } from './commission.service';
import { SetCommissionRuleDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Commission')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('commission-rules')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get()
  @Permissions('COMMISSION_MANAGE')
  @ApiOperation({ summary: 'Get active and historical commission rules across scopes' })
  async getRules() {
    return this.commissionService.getRules();
  }

  @Put()
  @Permissions('COMMISSION_MANAGE')
  @ApiOperation({ summary: 'Set or update commission rule (scope: global/category/city/mechanic-type)' })
  async setRule(
    @Body() dto: SetCommissionRuleDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.commissionService.setRule(dto, adminId);
  }
}
