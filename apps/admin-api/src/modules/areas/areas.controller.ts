import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AreasService } from './areas.service';
import { PauseAreaDto } from './dto/pause-area.dto';
import { AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard } from '../../common/guards';
import { Permissions, CurrentAdmin, AuthenticatedAdmin } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Areas')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Post(':id/pause')
  @Permissions('AREA_PAUSE')
  @ApiOperation({ summary: 'Pause new bookings in an area (Sub-Div+)' })
  async pause(
    @Param('id') id: string,
    @Body() dto: PauseAreaDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.areasService.pause(id, dto, admin, scope);
  }

  @Post(':id/resume')
  @Permissions('AREA_PAUSE')
  @ApiOperation({ summary: 'Resume bookings in a paused area' })
  async resume(
    @Param('id') id: string,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.areasService.resume(id, admin, scope);
  }
}
