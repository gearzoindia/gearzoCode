import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { SearchServiceDto } from './dto/search-service.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Services')
@Controller(['', 'customer'])
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get('service-categories')
  @ApiOperation({ summary: 'List all available service categories' })
  async getServiceCategories() {
    return this.servicesService.getServiceCategories();
  }

  @Public()
  @Get('services')
  @ApiOperation({ summary: 'List services with price resolution by vehicle & area' })
  async listServices(
    @Query('categoryId') categoryId?: string,
    @Query('vehicleTypeId') vehicleTypeId?: string,
    @Query('areaId') areaId?: string,
  ) {
    return this.servicesService.listServices(categoryId, vehicleTypeId, areaId);
  }

  @Public()
  @Get('services/:id')
  @ApiOperation({ summary: 'Get full service details, warranty, package items' })
  async getService(
    @Param('id') id: string,
    @Query('vehicleTypeId') vehicleTypeId?: string,
    @Query('areaId') areaId?: string,
  ) {
    return this.servicesService.getServiceById(id, vehicleTypeId, areaId);
  }

  @Public()
  @Get(['search', 'services/search'])
  @ApiOperation({ summary: 'Search services by keyword, category, and vehicle' })
  async search(@Query() dto: SearchServiceDto, @Query('q') q?: string) {
    if (q && !dto.query) {
      dto.query = q;
    }
    return this.servicesService.searchServices(dto);
  }
}
