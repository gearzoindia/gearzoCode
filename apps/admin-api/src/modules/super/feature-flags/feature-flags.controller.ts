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
import { FeatureFlagsService } from './feature-flags.service';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Feature Flags')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  @Permissions('FEATURE_FLAGS_MANAGE')
  @ApiOperation({ summary: 'List all dynamic feature flags' })
  async findAll() {
    return this.featureFlagsService.findAll();
  }

  @Get(':id')
  @Permissions('FEATURE_FLAGS_MANAGE')
  @ApiOperation({ summary: 'Get single feature flag' })
  async findOne(@Param('id') id: string) {
    return this.featureFlagsService.findOne(id);
  }

  @Post()
  @Permissions('FEATURE_FLAGS_MANAGE')
  @ApiOperation({ summary: 'Create feature flag with app and city rules' })
  async create(
    @Body() dto: CreateFeatureFlagDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.featureFlagsService.create(dto, adminId);
  }

  @Patch(':id')
  @Permissions('FEATURE_FLAGS_MANAGE')
  @ApiOperation({ summary: 'Update feature flag state or rollout percentage' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFeatureFlagDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.featureFlagsService.update(id, dto, adminId);
  }

  @Delete(':id')
  @Permissions('FEATURE_FLAGS_MANAGE')
  @ApiOperation({ summary: 'Delete feature flag' })
  async remove(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.featureFlagsService.remove(id, adminId);
  }
}
