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
import { AppVersionsService } from './app-versions.service';
import { CreateAppVersionDto, UpdateAppVersionDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - App Versions')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('app-versions')
export class AppVersionsController {
  constructor(private readonly appVersionsService: AppVersionsService) {}

  @Get()
  @Permissions('APP_VERSION_MANAGE')
  @ApiOperation({ summary: 'List supported and latest mobile/web app versions' })
  async findAll() {
    return this.appVersionsService.findAll();
  }

  @Get(':id')
  @Permissions('APP_VERSION_MANAGE')
  @ApiOperation({ summary: 'Get single app version rule' })
  async findOne(@Param('id') id: string) {
    return this.appVersionsService.findOne(id);
  }

  @Post()
  @Permissions('APP_VERSION_MANAGE')
  @ApiOperation({ summary: 'Define new app version policy' })
  async create(
    @Body() dto: CreateAppVersionDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.appVersionsService.create(dto, adminId);
  }

  @Patch(':id')
  @Permissions('APP_VERSION_MANAGE')
  @ApiOperation({ summary: 'Update minSupportedVersion or latestVersion force upgrade prompt' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppVersionDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.appVersionsService.update(id, dto, adminId);
  }

  @Delete(':id')
  @Permissions('APP_VERSION_MANAGE')
  @ApiOperation({ summary: 'Delete app version policy' })
  async remove(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.appVersionsService.remove(id, adminId);
  }
}
