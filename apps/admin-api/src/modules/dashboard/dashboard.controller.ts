import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto, LiveMapDto } from './dto/dashboard.dto';
import { AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard } from '../../common/guards';
import { Permissions } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @Permissions('DASHBOARD_VIEW')
  @ApiOperation({ summary: 'Get scoped dashboard overview statistics' })
  async getDashboard(@Query() dto: DashboardFilterDto, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.dashboardService.getStats(dto, scope);
  }

  @Get('live/mechanics')
  @Permissions('DASHBOARD_VIEW')
  @ApiOperation({ summary: 'Get active/online mechanics for live map view' })
  async getLiveMechanics(@Query() dto: LiveMapDto, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.dashboardService.getLiveMechanics(dto, scope);
  }

  @Get('live/bookings')
  @Permissions('DASHBOARD_VIEW')
  @ApiOperation({ summary: 'Get in-flight bookings for live map view' })
  async getLiveBookings(@Query() dto: LiveMapDto, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.dashboardService.getLiveBookings(dto, scope);
  }
}
