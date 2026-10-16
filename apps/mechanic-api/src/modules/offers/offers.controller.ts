import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { RejectOfferDto } from './dto/offers.dto';
import { MechanicAuthGuard } from '../../common/guards/auth.guard';
import { RequireMechanicStatusGuard } from '../../common/guards/mechanic-status.guard';
import { RequireMechanicStatus } from '../../common/decorators/require-mechanic-status.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Offers')
@Controller(['offers', 'mechanic/job-offers', 'mechanic/offers'])
@UseGuards(MechanicAuthGuard, RequireMechanicStatusGuard)
@RequireMechanicStatus('APPROVED')
@ApiBearerAuth()
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get job offer details with customer distance, ETA, and estimated earnings' })
  async getOffer(
    @CurrentUser('id') mechanicId: string,
    @Param('id') offerId: string,
  ) {
    return this.offersService.getOffer(mechanicId, offerId);
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atomically accept job offer and claim the booking' })
  async acceptOffer(
    @CurrentUser('id') mechanicId: string,
    @Param('id') offerId: string,
  ) {
    return this.offersService.acceptOffer(mechanicId, offerId);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject job offer without penalty' })
  async rejectOffer(
    @CurrentUser('id') mechanicId: string,
    @Param('id') offerId: string,
    @Body() dto: RejectOfferDto,
  ) {
    return this.offersService.rejectOffer(mechanicId, offerId, dto);
  }
}
