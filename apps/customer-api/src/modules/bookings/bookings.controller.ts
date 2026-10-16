import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import {
  BookingQuoteDto,
  ValidateCouponDto,
  CreateBookingDto,
  CancelBookingDto,
  ReviewBookingDto,
  ReportIssueDto,
} from './dto/booking.dto';
import { CustomerAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Bookings')
@Controller(['', 'customer'])
@UseGuards(CustomerAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Public()
  @Post('bookings/quote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate quotation & pricing breakdown for selected services' })
  async calculateQuote(@Body() dto: BookingQuoteDto) {
    return this.bookingsService.calculateQuote(dto);
  }

  @Post('coupons/validate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate discount coupon for booking' })
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    return this.bookingsService.validateCoupon(dto);
  }

  @Post('bookings')
  @ApiBearerAuth()
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Unique client key preventing duplicate bookings',
  })
  @ApiOperation({ summary: 'Create new booking with idempotency support' })
  async createBooking(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateBookingDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.bookingsService.createBooking(customerId, dto, idempotencyKey);
  }

  @Get('bookings')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List bookings for authenticated customer' })
  async listBookings(
    @CurrentUser('id') customerId: string,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.listBookings(customerId, status);
  }

  @Get('bookings/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full details of a specific booking' })
  async getBooking(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
  ) {
    return this.bookingsService.getBookingById(customerId, id);
  }

  @Get('bookings/:id/slot-hold')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check lock expiration time for slot hold' })
  async getSlotHold(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
  ) {
    return this.bookingsService.getSlotHold(customerId, id);
  }

  @Post('bookings/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel booking with fee calculation' })
  async cancelBooking(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancelBooking(customerId, id, dto);
  }

  @Post('bookings/:id/extras/:extraId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve mechanic additional extra work/parts request' })
  async approveExtra(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
    @Param('extraId') extraId: string,
  ) {
    return this.bookingsService.approveExtra(customerId, id, extraId);
  }

  @Post('bookings/:id/rebook')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fast repeat/rebook an earlier service' })
  async rebook(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
  ) {
    return this.bookingsService.rebook(customerId, id);
  }

  @Post('bookings/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit rating and review for completed booking' })
  async reviewBooking(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
    @Body() dto: ReviewBookingDto,
  ) {
    return this.bookingsService.reviewBooking(customerId, id, dto);
  }

  @Post('bookings/:id/issues')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report an issue or dispute for booking' })
  async reportIssue(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
    @Body() dto: ReportIssueDto,
  ) {
    return this.bookingsService.reportIssue(customerId, id, dto);
  }

  @Get('bookings/:id/invoice')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve or download booking invoice PDF' })
  async getInvoice(
    @CurrentUser('id') customerId: string,
    @Param('id') id: string,
  ) {
    return this.bookingsService.getInvoice(customerId, id);
  }

  @Public()
  @Get('review-tags')
  @ApiOperation({ summary: 'Get list of standard review tag chips' })
  async getReviewTags() {
    return this.bookingsService.getReviewTags();
  }

  @Public()
  @Get('serviceability')
  @ApiOperation({ summary: 'Check if location coordinates are serviceable' })
  async checkServiceability(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ) {
    return this.bookingsService.checkServiceability(lat, lng);
  }

  @Public()
  @Get('slots')
  @ApiOperation({ summary: 'Get available time slots for a specific date' })
  async getSlots(
    @Query('date') date: string,
    @Query('areaId') areaId?: string,
  ) {
    return this.bookingsService.getAvailableSlots(date, areaId);
  }
}
