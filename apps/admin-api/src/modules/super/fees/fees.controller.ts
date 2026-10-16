import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeesService } from './fees.service';
import { SetFeeRuleDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Fees')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get()
  @Permissions('FEES_MANAGE')
  @ApiOperation({ summary: 'Get active fee rules (visit, platform, cancellation, GST, towing per km)' })
  async getFees() {
    return this.feesService.getFees();
  }

  @Put()
  @Permissions('FEES_MANAGE')
  @ApiOperation({ summary: 'Set or update fee rule (flat or percent, city scoped)' })
  async setFee(
    @Body() dto: SetFeeRuleDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.feesService.setFee(dto, adminId);
  }
}
