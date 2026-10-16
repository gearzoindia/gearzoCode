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
import { SubscriptionsService } from './subscriptions.service';
import { ListSubscriptionPlansQueryDto, CreateSubscriptionDto } from './dto/subscription.dto';
import { CustomerAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Subscriptions')
@Controller(['', 'customer', 'customer/subscriptions'])
@UseGuards(CustomerAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Public()
  @Get(['subscription-plans', 'plans'])
  @ApiOperation({ summary: 'List active subscription plans filtered by vehicle type' })
  async listPlans(@Query() query: ListSubscriptionPlansQueryDto) {
    return this.subscriptionsService.listPlans(query.vehicleType);
  }

  @Public()
  @Get(['subscription-plans/:id', 'plans/:id'])
  @ApiOperation({ summary: 'Get details of a specific subscription plan' })
  async getPlan(@Param('id') id: string) {
    return this.subscriptionsService.planDetail(id);
  }

  @Get('me/subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List subscriptions owned by current customer' })
  async mySubscriptions(@CurrentUser('id') customerId: string) {
    return this.subscriptionsService.mySubscriptions(customerId);
  }

  @Post('subscriptions')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase/subscribe to a subscription plan' })
  async subscribe(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.subscribe(customerId, dto);
  }

  @Get('me/subscriptions/:id/usage')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get usage and benefits consumption for a subscription' })
  async getUsage(
    @CurrentUser('id') customerId: string,
    @Param('id') subscriptionId: string,
  ) {
    return this.subscriptionsService.getUsage(customerId, subscriptionId);
  }
}
