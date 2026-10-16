import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentPoliciesService } from './payment-policies.service';
import { CreatePaymentPolicyDto, UpdatePaymentPolicyDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Payment Policies')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('payment-policies')
export class PaymentPoliciesController {
  constructor(private readonly paymentPoliciesService: PaymentPoliciesService) {}

  @Get()
  @Permissions('PAYMENT_POLICY_MANAGE')
  @ApiOperation({ summary: 'List all payment policies (postpaid, prepaid, advance requirements)' })
  async findAll() {
    return this.paymentPoliciesService.findAll();
  }

  @Get(':id')
  @Permissions('PAYMENT_POLICY_MANAGE')
  @ApiOperation({ summary: 'Get single payment policy' })
  async findOne(@Param('id') id: string) {
    return this.paymentPoliciesService.findOne(id);
  }

  @Post()
  @Permissions('PAYMENT_POLICY_MANAGE')
  @ApiOperation({ summary: 'Create new payment policy rule' })
  async create(
    @Body() dto: CreatePaymentPolicyDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.paymentPoliciesService.create(dto, adminId);
  }

  @Patch(':id')
  @Permissions('PAYMENT_POLICY_MANAGE')
  @ApiOperation({ summary: 'Update payment policy configuration' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentPolicyDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.paymentPoliciesService.update(id, dto, adminId);
  }

  @Delete(':id')
  @Permissions('PAYMENT_POLICY_MANAGE')
  @ApiOperation({ summary: 'Delete payment policy rule' })
  async remove(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.paymentPoliciesService.remove(id, adminId);
  }
}
