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
import { JurisdictionsService } from './jurisdictions.service';
import { CreateJurisdictionDto, UpdateJurisdictionDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Jurisdictions')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('jurisdictions')
export class JurisdictionsController {
  constructor(private readonly jurisdictionsService: JurisdictionsService) {}

  @Get()
  @Permissions('JURISDICTION_MANAGE')
  @ApiOperation({ summary: 'List all divisions, sub-divisions, and areas with hierarchy' })
  async findAll() {
    return this.jurisdictionsService.findAll();
  }

  @Get(':id')
  @Permissions('JURISDICTION_MANAGE')
  @ApiOperation({ summary: 'Get jurisdiction details, polygon, and children' })
  async findOne(@Param('id') id: string) {
    return this.jurisdictionsService.findOne(id);
  }

  @Post()
  @Permissions('JURISDICTION_MANAGE')
  @ApiOperation({ summary: 'Create new division, sub-division, or area with polygon' })
  async create(
    @Body() dto: CreateJurisdictionDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.jurisdictionsService.create(dto, adminId);
  }

  @Patch(':id')
  @Permissions('JURISDICTION_MANAGE')
  @ApiOperation({ summary: 'Update jurisdiction details, parent, or polygon' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJurisdictionDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.jurisdictionsService.update(id, dto, adminId);
  }

  @Delete(':id')
  @Permissions('JURISDICTION_MANAGE')
  @ApiOperation({ summary: 'Deactivate jurisdiction' })
  async remove(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.jurisdictionsService.remove(id, adminId);
  }
}
