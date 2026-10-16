import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import {
  QueryPricingMatrixDto,
  SetPricingEntryDto,
  BulkSetPricingDto,
  ImportPricingCsvDto,
} from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Pricing')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  @Permissions('PRICING_MANAGE')
  @ApiOperation({ summary: 'Get pricing matrix for service x vehicleType x model x area' })
  async getPricing(@Query() dto: QueryPricingMatrixDto) {
    return this.pricingService.getPricing(dto);
  }

  @Put()
  @Permissions('PRICING_MANAGE')
  @ApiOperation({ summary: 'Update or insert single price matrix tier' })
  async upsertPrice(
    @Body() dto: SetPricingEntryDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.pricingService.upsertPrice(dto, adminId);
  }

  @Put('bulk')
  @Permissions('PRICING_MANAGE')
  @ApiOperation({ summary: 'Batch update pricing matrix' })
  async bulkUpsert(
    @Body() dto: BulkSetPricingDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.pricingService.bulkUpsert(dto, adminId);
  }

  @Post('import')
  @Permissions('PRICING_MANAGE')
  @ApiOperation({ summary: 'Bulk import pricing matrix via CSV (supports dryRun=true)' })
  @ApiQuery({ name: 'dryRun', required: false, type: Boolean })
  async importCsv(
    @Body() dto: ImportPricingCsvDto,
    @Query('dryRun') dryRun: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    const isDryRun = dryRun === 'true';
    return this.pricingService.importCsv(dto, isDryRun, adminId);
  }

  @Get('history')
  @Permissions('PRICING_MANAGE')
  @ApiOperation({ summary: 'Get price modification audit trail and history' })
  async getPriceHistory(@Query('serviceId') serviceId?: string) {
    return this.pricingService.getPriceHistory(serviceId);
  }
}
