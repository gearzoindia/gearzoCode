import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EarningsService } from './earnings.service';
import { EarningsLedgerQueryDto, PayDuesDto } from './dto/earnings.dto';
import { MechanicAuthGuard } from '../../common/guards/auth.guard';
import { RequireMechanicStatusGuard } from '../../common/guards/mechanic-status.guard';
import { RequireMechanicStatus } from '../../common/decorators/require-mechanic-status.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Earnings')
@Controller(['', 'mechanic'])
@UseGuards(MechanicAuthGuard, RequireMechanicStatusGuard)
@RequireMechanicStatus('APPROVED')
@ApiBearerAuth()
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  @Get(['earnings', 'earnings/summary'])
  @ApiOperation({ summary: 'Get earnings breakdown for today, this week, and this month' })
  async getSummary(@CurrentUser('id') mechanicId: string) {
    return this.earningsService.getSummary(mechanicId);
  }

  @Get('earnings/ledger')
  @ApiOperation({ summary: 'Get paginated mechanic earnings and deductions ledger' })
  async getLedger(
    @CurrentUser('id') mechanicId: string,
    @Query() query: EarningsLedgerQueryDto,
  ) {
    return this.earningsService.getLedger(mechanicId, query);
  }

  @Get('payouts')
  @ApiOperation({ summary: 'Get payout run transaction history and bank settlement UTR' })
  async getPayouts(@CurrentUser('id') mechanicId: string) {
    return this.earningsService.getPayouts(mechanicId);
  }

  @Post('dues/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Razorpay order to pay platform commission dues' })
  async payDues(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: PayDuesDto,
  ) {
    return this.earningsService.payDues(mechanicId, dto);
  }
}
