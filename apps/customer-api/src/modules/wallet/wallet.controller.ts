import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { TopupWalletDto, PayDuesDto, WalletLedgerQueryDto } from './dto/wallet.dto';
import { CustomerAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wallet')
@Controller()
@UseGuards(CustomerAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('wallet')
  @ApiOperation({ summary: 'Get wallet balance, dues, and transaction status' })
  async getWallet(@CurrentUser('id') customerId: string) {
    return this.walletService.getBalance(customerId);
  }

  @Get('wallet/ledger')
  @ApiOperation({ summary: 'Get paginated customer wallet ledger history' })
  async getLedger(
    @CurrentUser('id') customerId: string,
    @Query() query: WalletLedgerQueryDto,
  ) {
    return this.walletService.getLedger(customerId, query);
  }

  @Post('wallet/topup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Razorpay order for wallet topup' })
  async topup(
    @CurrentUser('id') customerId: string,
    @Body() dto: TopupWalletDto,
  ) {
    return this.walletService.topup(customerId, dto);
  }

  @Post('wallet/pay-dues')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Razorpay order to clear wallet dues' })
  async payDues(
    @CurrentUser('id') customerId: string,
    @Body() dto: PayDuesDto,
  ) {
    return this.walletService.payDues(customerId, dto);
  }

  @Post('refunds/:id/to-source')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request an eligible refund to be sent to original payment source' })
  async refundToSource(
    @CurrentUser('id') customerId: string,
    @Param('id') refundId: string,
  ) {
    return this.walletService.refundToSource(customerId, refundId);
  }
}
