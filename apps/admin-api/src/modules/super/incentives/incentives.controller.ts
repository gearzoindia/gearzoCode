import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IncentivesService } from './incentives.service';
import { CreateIncentiveRuleDto, UpdateIncentiveRuleDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Incentives')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('incentive-rules')
export class IncentivesController {
  constructor(private readonly incentivesService: IncentivesService) {}

  @Get()
  @Permissions('INCENTIVE_MANAGE')
  @ApiOperation({ summary: 'List mechanic incentive rules (peak surge, target bonus, zero commission)' })
  async findAll() {
    return this.incentivesService.findAll();
  }

  @Get(':id')
  @Permissions('INCENTIVE_MANAGE')
  @ApiOperation({ summary: 'Get single incentive campaign rule' })
  async findOne(@Param('id') id: string) {
    return this.incentivesService.findOne(id);
  }

  @Post()
  @Permissions('INCENTIVE_MANAGE')
  @ApiOperation({ summary: 'Create incentive campaign' })
  async create(
    @Body() dto: CreateIncentiveRuleDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.incentivesService.create(dto, adminId);
  }

  @Patch(':id')
  @Permissions('INCENTIVE_MANAGE')
  @ApiOperation({ summary: 'Update incentive campaign parameters or active dates' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateIncentiveRuleDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.incentivesService.update(id, dto, adminId);
  }

  @Delete(':id')
  @Permissions('INCENTIVE_MANAGE')
  @ApiOperation({ summary: 'Deactivate incentive campaign' })
  async remove(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.incentivesService.remove(id, adminId);
  }
}
