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
import { ApprovalsService } from './approvals.service';
import { QueryApprovalsDto, ApproveRequestDto, RejectRequestDto } from './dto';
import {
  AdminAuthGuard,
  PermissionsGuard,
  JurisdictionScopeGuard,
} from '../../common/guards';
import { CurrentAdmin, AuthenticatedAdmin } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get administrative approval requests inbox' })
  async findAll(
    @Query() dto: QueryApprovalsDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.approvalsService.findAll(dto, admin, scope);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve request (Validates Maker != Checker, rank, re-auth for money)' })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveRequestDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
  ) {
    return this.approvalsService.approve(id, dto, admin, admin.reAuthAt);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject request with explanation note' })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectRequestDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
  ) {
    return this.approvalsService.reject(id, dto, admin);
  }
}
