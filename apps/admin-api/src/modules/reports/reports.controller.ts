import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { QueryReportDto, CreateExportDto } from './dto';
import { AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard } from '../../common/guards';
import { Permissions, CurrentAdmin } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Reports & Exports')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('reports/:type')
  @Permissions('REPORT_VIEW')
  @ApiOperation({ summary: 'Get aggregated metric reports (bookings, revenue, mechanics, customers, area-health)' })
  async getReport(
    @Param('type') type: string,
    @Query() dto: QueryReportDto,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.reportsService.getReport(type, dto, scope);
  }

  @Post('exports')
  @Permissions('REPORT_EXPORT')
  @ApiOperation({ summary: 'Request asynchronous data export in CSV or XLSX' })
  async createExport(
    @Body() dto: CreateExportDto,
    @CurrentAdmin('id') adminId: string,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.reportsService.createExport(dto, adminId, scope);
  }

  @Get('exports/:id')
  @Permissions('REPORT_EXPORT')
  @ApiOperation({ summary: 'Retrieve secure download URL for generated export (15-min TTL)' })
  async getExportDownload(@Param('id') id: string) {
    return this.reportsService.getExportDownload(id);
  }
}
