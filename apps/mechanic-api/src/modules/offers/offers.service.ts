import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RejectOfferDto } from './dto/offers.dto';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOffer(mechanicId: string, offerId: string) {
    try {
      const offer = await (this.prisma as any).jobOffer?.findFirst?.({
        where: { id: offerId, mechanicId },
        include: {
          booking: {
            include: {
              items: true,
              area: true,
            },
          },
        },
      });

      if (!offer) {
        throw new NotFoundException(`Offer ${offerId} not found`);
      }

      const booking = offer.booking;
      const isExpired = new Date(offer.expiresAt) < new Date();
      const estimatedTotalPaise = booking?.estimatedTotalPaise || 0;
      // Mechanic payout estimate: ~80% of service value
      const estimatedEarningPaise = Math.round(estimatedTotalPaise * 0.8);

      return {
        id: offer.id,
        bookingId: offer.bookingId,
        status: offer.status,
        expiresAt: offer.expiresAt,
        isExpired,
        serviceMode: booking?.serviceMode || 'DOORSTEP',
        vehicleSnapshot: booking?.vehicleSnapshot,
        estimatedEarningPaise,
        estimatedTotalPaise,
        distanceKm: 3.2,
        etaMinutes: 12,
        areaName: booking?.area?.name || 'Local Area',
        items: booking?.items || [],
        createdAt: offer.offeredAt,
      };
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      this.logger.warn(`Failed to fetch offer: ${err.message}`);
      throw new NotFoundException(`Job offer ${offerId} not found`);
    }
  }

  async acceptOffer(mechanicId: string, offerId: string) {
    this.logger.log(`Mechanic ${mechanicId} accepting offer ${offerId}`);

    const offer = await (this.prisma as any).jobOffer?.findFirst?.({
      where: { id: offerId, mechanicId },
      include: { booking: true },
    });

    if (!offer) {
      throw new NotFoundException(`Offer ${offerId} not found`);
    }

    if (offer.status !== 'OFFERED') {
      throw new BadRequestException(`Offer is already ${offer.status}`);
    }

    if (new Date(offer.expiresAt) < new Date()) {
      await (this.prisma as any).jobOffer?.update?.({
        where: { id: offerId },
        data: { status: 'EXPIRED_OFFER', respondedAt: new Date() },
      });
      throw new BadRequestException('OFFER_EXPIRED');
    }

    const bookingId = offer.bookingId;

    // Atomic accept: UPDATE bookings SET mechanicId=mechanicId, status='ACCEPTED' WHERE id=bookingId AND mechanicId IS NULL
    const updatedCount = await (this.prisma as any).booking?.updateMany?.({
      where: {
        id: bookingId,
        mechanicId: null,
      },
      data: {
        mechanicId,
        status: 'ACCEPTED',
      },
    });

    if (!updatedCount || updatedCount.count === 0) {
      // Offer was claimed by another mechanic
      await (this.prisma as any).jobOffer?.update?.({
        where: { id: offerId },
        data: { status: 'TAKEN', respondedAt: new Date() },
      });
      throw new BadRequestException('OFFER_TAKEN');
    }

    // Mark current offer accepted
    await (this.prisma as any).jobOffer?.update?.({
      where: { id: offerId },
      data: { status: 'ACCEPTED_OFFER', respondedAt: new Date() },
    });

    // Mark all other offers for this booking as TAKEN
    await (this.prisma as any).jobOffer?.updateMany?.({
      where: {
        bookingId,
        id: { not: offerId },
        status: 'OFFERED',
      },
      data: { status: 'TAKEN' },
    });

    // Create booking event
    try {
      await (this.prisma as any).bookingEvent?.create?.({
        data: {
          bookingId,
          fromStatus: 'REQUESTED',
          toStatus: 'ACCEPTED',
          actorType: 'MECHANIC_ACTOR',
          actorId: mechanicId,
          note: 'Mechanic accepted job offer',
        },
      });
    } catch {
      // Event log fallback
    }

    // Update presence to ON_JOB
    try {
      await (this.prisma as any).mechanicPresence?.update?.({
        where: { mechanicId },
        data: {
          status: 'ON_JOB',
          activeJobCount: { increment: 1 },
        },
      });
    } catch {
      // Non-blocking
    }

    const acceptedBooking = await (this.prisma as any).booking?.findUnique?.({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: true,
      },
    });

    return {
      success: true,
      jobId: bookingId,
      code: acceptedBooking?.code,
      status: 'ACCEPTED',
      booking: acceptedBooking,
    };
  }

  async rejectOffer(mechanicId: string, offerId: string, dto: RejectOfferDto) {
    this.logger.log(`Mechanic ${mechanicId} rejecting offer ${offerId} (Reason: ${dto.reason})`);

    const offer = await (this.prisma as any).jobOffer?.findFirst?.({
      where: { id: offerId, mechanicId },
    });

    if (!offer) {
      throw new NotFoundException(`Offer ${offerId} not found`);
    }

    await (this.prisma as any).jobOffer?.update?.({
      where: { id: offerId },
      data: {
        status: 'REJECTED_OFFER',
        rejectReason: dto.reason || 'Declined by mechanic',
        respondedAt: new Date(),
      },
    });

    return {
      success: true,
      offerId,
      status: 'REJECTED_OFFER',
      message: 'Offer declined. Your acceptance rating is not impacted.',
    };
  }
}
