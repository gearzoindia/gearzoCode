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
import { MechanicsService } from './mechanics.service';
import {
  QueryMechanicsDto,
  ReviewKycDto,
  SuspendMechanicDto,
} from './dto';
import { AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard } from '../../common/guards';
import { Permissions, CurrentAdmin, AuthenticatedAdmin } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Mechanics')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Get()
  @Permissions('MECHANIC_VIEW')
  @ApiOperation({ summary: 'List mechanics (paginated, jurisdiction scoped)' })
  async findAll(@Query() dto: QueryMechanicsDto, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.mechanicsService.findAll(dto, scope);
  }

  @Get(['kyc-queue', 'kyc/queue'])
  @Permissions('MECHANIC_KYC_REVIEW')
  @ApiOperation({ summary: 'Get KYC verification queue (oldest first)' })
  async getKycQueue(@Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.mechanicsService.getKycQueue(scope);
  }

  @Get(':id')
  @Permissions('MECHANIC_VIEW')
  @ApiOperation({ summary: 'Get complete mechanic profile, performance, and ledger' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.mechanicsService.findOne(id, scope);
  }

  @Post(':id/kyc/review')
  @Permissions('MECHANIC_KYC_REVIEW')
  @ApiOperation({ summary: 'Review and approve/reject mechanic KYC documents and background' })
  async reviewKyc(
    @Param('id') id: string,
    @Body() dto: ReviewKycDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.mechanicsService.reviewKyc(id, dto, admin, scope);
  }

  @Post(':id/suspend')
  @Permissions('MECHANIC_SUSPEND')
  @ApiOperation({ summary: 'Suspend mechanic (Area Admin creates approval request, Sub-Div+ executes)' })
  async suspend(
    @Param('id') id: string,
    @Body() dto: SuspendMechanicDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.mechanicsService.suspend(id, dto, admin, scope);
  }

  @Post(':id/reactivate')
  @Permissions('MECHANIC_SUSPEND')
  @ApiOperation({ summary: 'Reactivate suspended mechanic account' })
  async reactivate(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.mechanicsService.reactivate(id, adminId, scope);
  }

  @Get(':id/documents/:docId/url')
  @Permissions('KYC_VIEW_FULL')
  @ApiOperation({ summary: 'Get temporary signed URL for viewing sensitive KYC document' })
  async getDocumentSignedUrl(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @CurrentAdmin('id') adminId: string,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.mechanicsService.getDocumentSignedUrl(id, docId, adminId, scope);
  }

  @Post(':id/force-logout')
  @Permissions('MECHANIC_VIEW')
  @ApiOperation({ summary: 'Force logout mechanic and revoke all active sessions' })
  async forceLogout(@Param('id') id: string, @CurrentAdmin('id') adminId: string) {
    return this.mechanicsService.forceLogout(id, adminId);
  }
}
