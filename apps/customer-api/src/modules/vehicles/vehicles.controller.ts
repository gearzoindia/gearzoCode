import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { CustomerAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Vehicles')
@Controller(['', 'customer'])
@UseGuards(CustomerAuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Public()
  @Get('vehicle-types')
  @ApiOperation({ summary: 'List available vehicle types (2W, 4W, etc.)' })
  async getVehicleTypes() {
    return this.vehiclesService.getVehicleTypes();
  }

  @Public()
  @Get('vehicle-brands')
  @ApiOperation({ summary: 'List vehicle brands by type' })
  async getVehicleBrands(@Query('typeId') typeId?: string) {
    return this.vehiclesService.getVehicleBrands(typeId);
  }

  @Public()
  @Get('vehicle-models')
  @ApiOperation({ summary: 'List vehicle models by brand' })
  async getVehicleModels(@Query('brandId') brandId?: string) {
    return this.vehiclesService.getVehicleModels(brandId);
  }

  @Get('vehicles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all vehicles for authenticated customer' })
  async listVehicles(@CurrentUser('id') customerId: string) {
    return this.vehiclesService.listCustomerVehicles(customerId);
  }

  @Post('vehicles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new customer vehicle (Max 10)' })
  async createVehicle(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.createVehicle(customerId, dto);
  }

  @Get('vehicles/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get details of a specific vehicle' })
  async getVehicle(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.getCustomerVehicleById(customerId, id);
  }

  @Patch('vehicles/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vehicle details' })
  async updateVehicle(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.updateVehicle(customerId, id, dto);
  }

  @Delete('vehicles/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete a vehicle' })
  async deleteVehicle(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.deleteVehicle(customerId, id);
  }

  @Post('vehicles/:id/default')
  @Patch('vehicles/:id/default')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set vehicle as default' })
  async setDefaultVehicle(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.setDefaultVehicle(customerId, id);
  }
}
