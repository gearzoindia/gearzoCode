import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { CustomerAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(CustomerAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List customer saved addresses (Max 10)' })
  async list(@CurrentUser('id') customerId: string) {
    return this.addressesService.list(customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Save new customer address with area resolution' })
  async create(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.create(customerId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update existing address' })
  async update(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(customerId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a customer address' })
  async delete(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
  ) {
    return this.addressesService.delete(customerId, id);
  }

  @Post(':id/default')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set address as default' })
  async setDefault(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
  ) {
    return this.addressesService.setDefault(customerId, id);
  }
}
