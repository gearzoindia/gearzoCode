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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import {
  QueryAdminsDto,
  InviteAdminDto,
  UpdateAdminDto,
  DisableAdminDto,
} from './dto';
import {
  AdminAuthGuard,
  PermissionsGuard,
  JurisdictionScopeGuard,
  ReAuthGuard,
} from '../../common/guards';
import {
  Permissions,
  RequireReAuth,
  CurrentAdmin,
  AuthenticatedAdmin,
} from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Admin Management')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard, ReAuthGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @Permissions('ADMIN_MANAGE')
  @ApiOperation({ summary: 'List lower-role administrators in authorized jurisdiction subtree' })
  async findAll(
    @Query() dto: QueryAdminsDto,
    @CurrentAdmin() currentAdmin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.adminsService.findAll(dto, currentAdmin, scope);
  }

  @Get(':id')
  @Permissions('ADMIN_MANAGE')
  @ApiOperation({ summary: 'Get details of an administrator' })
  async findOne(
    @Param('id') id: string,
    @CurrentAdmin() currentAdmin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.adminsService.findOne(id, currentAdmin, scope);
  }

  @Post('invite')
  @Permissions('ADMIN_MANAGE')
  @ApiOperation({ summary: 'Invite new administrator (role must be lower, jurisdiction in subtree)' })
  async invite(
    @Body() dto: InviteAdminDto,
    @CurrentAdmin() currentAdmin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.adminsService.invite(dto, currentAdmin, scope);
  }

  @Patch(':id')
  @Permissions('ADMIN_MANAGE')
  @ApiOperation({ summary: 'Update admin role or jurisdiction (forces logout on change)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @CurrentAdmin() currentAdmin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.adminsService.update(id, dto, currentAdmin, scope);
  }

  @Post(':id/disable')
  @Permissions('ADMIN_MANAGE')
  @ApiOperation({ summary: 'Disable admin account and revoke active sessions' })
  async disable(
    @Param('id') id: string,
    @Body() dto: DisableAdminDto,
    @CurrentAdmin() currentAdmin: AuthenticatedAdmin,
  ) {
    return this.adminsService.disable(id, dto, currentAdmin);
  }

  @Post(':id/enable')
  @Permissions('ADMIN_MANAGE')
  @ApiOperation({ summary: 'Re-enable disabled administrator account' })
  async enable(
    @Param('id') id: string,
    @CurrentAdmin() currentAdmin: AuthenticatedAdmin,
  ) {
    return this.adminsService.enable(id, currentAdmin);
  }

  @Post(':id/reset-2fa')
  @RequireReAuth()
  @Permissions('ADMIN_MANAGE')
  @ApiOperation({ summary: 'Reset 2FA for subordinate administrator (requires supervisor re-auth)' })
  async reset2fa(
    @Param('id') id: string,
    @CurrentAdmin() currentAdmin: AuthenticatedAdmin,
  ) {
    return this.adminsService.reset2fa(id, currentAdmin);
  }

  @Delete(':id/sessions')
  @Permissions('ADMIN_MANAGE')
  @ApiOperation({ summary: 'Terminate all active sessions for administrator' })
  async revokeSessions(
    @Param('id') id: string,
    @CurrentAdmin() currentAdmin: AuthenticatedAdmin,
  ) {
    return this.adminsService.revokeSessions(id, currentAdmin);
  }
}
