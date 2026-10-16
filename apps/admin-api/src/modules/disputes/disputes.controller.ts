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
import { DisputesService } from './disputes.service';
import {
  QueryDisputesDto,
  AddDisputeMessageDto,
  ResolveDisputeDto,
  EscalateDisputeDto,
} from './dto';
import { AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard } from '../../common/guards';
import { Permissions, CurrentAdmin } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Disputes')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  @Permissions('DISPUTE_HANDLE')
  @ApiOperation({ summary: 'List customer and mechanic disputes with SLA tracking' })
  async findAll(@Query() dto: QueryDisputesDto, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.disputesService.findAll(dto, scope);
  }

  @Get(':id')
  @Permissions('DISPUTE_HANDLE')
  @ApiOperation({ summary: 'Get dispute details, booking context, and message thread' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.disputesService.findOne(id, scope);
  }

  @Post(':id/messages')
  @Permissions('DISPUTE_HANDLE')
  @ApiOperation({ summary: 'Add message or internal administrative note to dispute thread' })
  async addMessage(
    @Param('id') id: string,
    @Body() dto: AddDisputeMessageDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.disputesService.addMessage(id, dto, adminId);
  }

  @Post(':id/resolve')
  @Permissions('DISPUTE_HANDLE')
  @ApiOperation({ summary: 'Resolve dispute with optional refund or mechanic penalty' })
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.disputesService.resolve(id, dto, adminId);
  }

  @Post(':id/escalate')
  @Permissions('DISPUTE_HANDLE')
  @ApiOperation({ summary: 'Escalate dispute to higher administrative tier' })
  async escalate(
    @Param('id') id: string,
    @Body() dto: EscalateDisputeDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.disputesService.escalate(id, dto, adminId);
  }
}
