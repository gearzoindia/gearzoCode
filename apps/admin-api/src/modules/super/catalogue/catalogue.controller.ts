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
import { CatalogueService } from './catalogue.service';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
  CreateServiceDto,
  UpdateServiceDto,
} from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Catalogue')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller()
export class CatalogueController {
  constructor(private readonly catalogueService: CatalogueService) {}

  // Categories
  @Get('service-categories')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'List all service categories with sort order' })
  async findAllCategories() {
    return this.catalogueService.findAllCategories();
  }

  @Get('service-categories/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Get single service category' })
  async findCategory(@Param('id') id: string) {
    return this.catalogueService.findCategory(id);
  }

  @Post('service-categories')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Create service category' })
  async createCategory(
    @Body() dto: CreateServiceCategoryDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.catalogueService.createCategory(dto, adminId);
  }

  @Patch('service-categories/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Update service category details and sort order' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateServiceCategoryDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.catalogueService.updateCategory(id, dto, adminId);
  }

  @Delete('service-categories/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Deactivate service category' })
  async removeCategory(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.catalogueService.removeCategory(id, adminId);
  }

  // Services
  @Get('services')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'List all catalog services' })
  async findAllServices() {
    return this.catalogueService.findAllServices();
  }

  @Get('services/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Get single service details with package items and pricing' })
  async findService(@Param('id') id: string) {
    return this.catalogueService.findService(id);
  }

  @Post('services')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Create service with vehicle types, duration, and modes' })
  async createService(
    @Body() dto: CreateServiceDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.catalogueService.createService(dto, adminId);
  }

  @Patch('services/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Update catalog service definition' })
  async updateService(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.catalogueService.updateService(id, dto, adminId);
  }

  @Delete('services/:id')
  @Permissions('CATALOGUE_MANAGE')
  @ApiOperation({ summary: 'Deactivate service' })
  async removeService(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.catalogueService.removeService(id, adminId);
  }
}
