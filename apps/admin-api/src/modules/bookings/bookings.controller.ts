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
import { BookingsService } from './bookings.service';
import {
  QueryBookingsDto,
  AssignBookingDto,
  CancelBookingDto,
  AddBookingNoteDto,
} from './dto';
import { AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard } from '../../common/guards';
import { Permissions, CurrentAdmin } from '../../common/decorators';
import { Request } from 'express';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard, JurisdictionScopeGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Permissions('BOOKING_VIEW')
  @ApiOperation({ summary: 'List bookings (paginated, scoped to jurisdiction)' })
  async findAll(@Query() dto: QueryBookingsDto, @Req() req: Request) {
    const scope = (req as any).jurisdictionScope;
    return this.bookingsService.findAll(dto, scope);
  }

  @Get(':id')
  @Permissions('BOOKING_VIEW')
  @ApiOperation({ summary: 'Get full booking details and timeline' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @CurrentAdmin('permissions') permissions: string[],
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.bookingsService.findOne(id, scope, permissions || []);
  }

  @Post(':id/assign')
  @Permissions('BOOKING_REASSIGN')
  @ApiOperation({ summary: 'Manually assign or reassign mechanic to booking' })
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignBookingDto,
    @CurrentAdmin('id') adminId: string,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.bookingsService.assign(id, dto, adminId, scope);
  }

  @Post(':id/cancel')
  @Permissions('BOOKING_CANCEL')
  @ApiOperation({ summary: 'Admin cancel booking with reason' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
    @CurrentAdmin('id') adminId: string,
    @Req() req: Request,
  ) {
    const scope = (req as any).jurisdictionScope;
    return this.bookingsService.cancel(id, dto, adminId, scope);
  }

  @Post(':id/notes')
  @Permissions('BOOKING_VIEW')
  @ApiOperation({ summary: 'Add internal administrative note to booking timeline' })
  async addNote(
    @Param('id') id: string,
    @Body() dto: AddBookingNoteDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.bookingsService.addNote(id, dto, adminId);
  }
}
