import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BroadcastsService } from './broadcasts.service';
import { CreateBroadcastDto } from './dto';
import { AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard } from '../../common/guards';
import { Permissions, CurrentAdmin, AuthenticatedAdmin } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Broadcasts')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller('broadcasts')
export class BroadcastsController {
  constructor(private readonly broadcastsService: BroadcastsService) {}

  @Get()
  @Permissions('BROADCAST_SEND')
  @ApiOperation({ summary: 'List recent administrative broadcasts' })
  async findAll(@Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.broadcastsService.findAll(scope);
  }

  @Post()
  @Permissions('BROADCAST_SEND')
  @ApiOperation({ summary: 'Create and send or schedule targeted push broadcast (max 3/day per audience)' })
  async create(
    @Body() dto: CreateBroadcastDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.broadcastsService.create(dto, admin, scope);
  }

  @Post(':id/cancel')
  @Permissions('BROADCAST_SEND')
  @ApiOperation({ summary: 'Cancel a scheduled broadcast before dispatch' })
  async cancel(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.broadcastsService.cancel(id, adminId);
  }
}
