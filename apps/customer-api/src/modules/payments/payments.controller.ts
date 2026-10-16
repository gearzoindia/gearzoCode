import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentOrderDto, VerifyPaymentDto } from './dto/payment.dto';
import { CustomerAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments/orders')
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Razorpay payment order for a booking' })
  async createOrder(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreatePaymentOrderDto,
  ) {
    return this.paymentsService.createOrder(customerId, dto);
  }

  @Post('payments/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CustomerAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay signature after checkout' })
  async verifyPayment(
    @CurrentUser('id') customerId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(customerId, dto);
  }

  @Public()
  @Post('webhooks/razorpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay payment lifecycle webhook receiver' })
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any,
  ) {
    return this.paymentsService.handleWebhook(signature, payload);
  }
}
