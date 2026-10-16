import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesMasterService } from './vehicles-master.service';
import {
  CreateVehicleBrandDto,
  UpdateVehicleBrandDto,
  CreateVehicleModelDto,
  UpdateVehicleModelDto,
  MergeCustomModelDto,
} from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Vehicles Master')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller()
export class VehiclesMasterController {
  constructor(private readonly vehiclesMasterService: VehiclesMasterService) {}

  // Brands
  @Get('vehicle-brands')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'List vehicle brands' })
  async findAllBrands() {
    return this.vehiclesMasterService.findAllBrands();
  }

  @Get('vehicle-brands/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Get single vehicle brand and its models' })
  async findBrand(@Param('id') id: string) {
    return this.vehiclesMasterService.findBrand(id);
  }

  @Post('vehicle-brands')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Create vehicle brand' })
  async createBrand(
    @Body() dto: CreateVehicleBrandDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.vehiclesMasterService.createBrand(dto, adminId);
  }

  @Patch('vehicle-brands/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Update vehicle brand' })
  async updateBrand(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleBrandDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.vehiclesMasterService.updateBrand(id, dto, adminId);
  }

  @Delete('vehicle-brands/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Deactivate vehicle brand' })
  async removeBrand(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.vehiclesMasterService.removeBrand(id, adminId);
  }

  // Models
  @Get('vehicle-models')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'List vehicle models optionally filtered by brand' })
  async findAllModels(@Query('brandId') brandId?: string) {
    return this.vehiclesMasterService.findAllModels(brandId);
  }

  @Get('vehicle-models/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Get single vehicle model' })
  async findModel(@Param('id') id: string) {
    return this.vehiclesMasterService.findModel(id);
  }

  @Post('vehicle-models')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Create vehicle model' })
  async createModel(
    @Body() dto: CreateVehicleModelDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.vehiclesMasterService.createModel(dto, adminId);
  }

  @Patch('vehicle-models/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Update vehicle model' })
  async updateModel(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleModelDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.vehiclesMasterService.updateModel(id, dto, adminId);
  }

  @Delete('vehicle-models/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Deactivate vehicle model' })
  async removeModel(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.vehiclesMasterService.removeModel(id, adminId);
  }

  // Pending Custom Models
  @Get('pending-models')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Get customer-submitted "Other" custom vehicle models to review' })
  async getPendingModels() {
    return this.vehiclesMasterService.getPendingModels();
  }

  @Post('pending-models/merge')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Merge custom-submitted model name into official master model' })
  async mergeCustomModel(
    @Body() dto: MergeCustomModelDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.vehiclesMasterService.mergeCustomModel(dto, adminId);
  }
}
