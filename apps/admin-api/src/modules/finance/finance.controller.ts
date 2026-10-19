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
import { FinanceService } from './finance.service';
import {
  CreateRefundDto,
  QueryPayoutRunsDto,
  MarkPayoutPaidDto,
  LedgerAdjustmentDto,
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

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard, ReAuthGuard)
@Controller(['finance', ''])
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('refunds')
  @Permissions('REFUND_APPROVE')
  @ApiOperation({ summary: 'List customer refunds and adjustments' })
  async findAllRefunds(@Query() query: any, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.financeService.findAllRefunds(query, scope);
  }

  @Post('refunds')
  @RequireReAuth()
  @Permissions('REFUND_APPROVE')
  @ApiOperation({ summary: 'Issue booking refund (enforces role limit, requires 5-min re-auth)' })
  async createRefund(
    @Body() dto: CreateRefundDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
  ) {
    return this.financeService.createRefund(dto, admin);
  }

  @Get('payout-runs')
  @Permissions('PAYOUT_PREPARE')
  @ApiOperation({ summary: 'List payout batches/runs scoped to jurisdiction' })
  async findAllPayoutRuns(@Query() dto: QueryPayoutRunsDto, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.financeService.findAllPayoutRuns(dto, scope);
  }

  @Get('payout-runs/:id')
  @Permissions('PAYOUT_PREPARE')
  @ApiOperation({ summary: 'Get payout run details with mechanic breakdown' })
  async findOnePayoutRun(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.financeService.findOnePayoutRun(id, scope);
  }

  @Post('payout-runs/:id/prepare')
  @Permissions('PAYOUT_PREPARE')
  @ApiOperation({ summary: 'Sub-Div+ submits payout run for maker-checker review' })
  async preparePayoutRun(
    @Param('id') id: string,
    @CurrentAdmin() admin: AuthenticatedAdmin,
  ) {
    return this.financeService.preparePayoutRun(id, admin);
  }

  @Post('payout-runs/:id/approve')
  @RequireReAuth()
  @Permissions('PAYOUT_APPROVE')
  @ApiOperation({ summary: 'Div+ approves payout run (Maker != Checker, requires re-auth)' })
  async approvePayoutRun(
    @Param('id') id: string,
    @CurrentAdmin() admin: AuthenticatedAdmin,
  ) {
    return this.financeService.approvePayoutRun(id, admin);
  }

  @Post('payouts/:id/mark-paid')
  @RequireReAuth()
  @Permissions('PAYOUT_APPROVE')
  @ApiOperation({ summary: 'Record settlement bank UTR for individual mechanic payout' })
  async markPayoutPaid(
    @Param('id') id: string,
    @Body() dto: MarkPayoutPaidDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.financeService.markPayoutPaid(id, dto, adminId);
  }

  @Post('ledger-adjustments')
  @RequireReAuth()
  @Permissions('LEDGER_ADJUST')
  @ApiOperation({ summary: 'Adjust mechanic ledger balance (Div+ with limits, requires re-auth)' })
  async adjustLedger(
    @Body() dto: LedgerAdjustmentDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
  ) {
    return this.financeService.adjustLedger(dto, admin);
  }
}
