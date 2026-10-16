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
import { CustomersService } from './customers.service';
import { QueryCustomersDto, BlockCustomerDto } from './dto';
import { AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard } from '../../common/guards';
import { Permissions, CurrentAdmin } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Permissions('CUSTOMER_VIEW')
  @ApiOperation({ summary: 'Search and list customers (phone masked)' })
  async findAll(@Query() dto: QueryCustomersDto, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.customersService.findAll(dto, scope);
  }

  @Get(':id')
  @Permissions('CUSTOMER_VIEW')
  @ApiOperation({ summary: 'Get customer profile, vehicles, addresses, and history' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.customersService.findOne(id, scope);
  }

  @Post(':id/block')
  @Permissions('CUSTOMER_BLOCK')
  @ApiOperation({ summary: 'Block customer and revoke sessions' })
  async block(
    @Param('id') id: string,
    @Body() dto: BlockCustomerDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.customersService.block(id, dto, adminId);
  }

  @Post(':id/unblock')
  @Permissions('CUSTOMER_BLOCK')
  @ApiOperation({ summary: 'Unblock customer' })
  async unblock(
    @Param('id') id: string,
    @Body() dto: BlockCustomerDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.customersService.unblock(id, dto, adminId);
  }
}
