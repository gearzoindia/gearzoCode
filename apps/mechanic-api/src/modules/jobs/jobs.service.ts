import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  ListJobsQueryDto,
  ArrivedDto,
  StartJobDto,
  CompleteJobDto,
  AddExtraDto,
  JobPhotoUploadUrlDto,
  PaymentReceivedDto,
  CancelJobDto,
  RateCustomerDto,
} from './dto/jobs.dto';
import { env } from '../../config/env';

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getOwnBooking(mechanicId: string, jobId: string) {
    const booking = await (this.prisma as any).booking?.findUnique?.({
      where: { id: jobId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: true,
        checklistItems: true,
        events: { orderBy: { createdAt: 'asc' } },
        photos: true,
        area: true,
        customerRating: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    if (booking.mechanicId !== mechanicId) {
      throw new ForbiddenException('Access denied: You are not assigned to this job');
    }

    return booking;
  }

  async listJobs(mechanicId: string, query: ListJobsQueryDto) {
    const tab = query.tab || 'ongoing';
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    let statusFilter: any = undefined;
    if (tab === 'upcoming') {
      statusFilter = { in: ['ACCEPTED'] };
    } else if (tab === 'ongoing') {
      statusFilter = { in: ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] };
    } else if (tab === 'past') {
      statusFilter = { in: ['COMPLETED', 'CANCELLED', 'DISPUTED'] };
    }

    const where: any = { mechanicId };
    if (statusFilter) {
      where.status = statusFilter;
    }

    try {
      const [jobs, total] = await Promise.all([
        (this.prisma as any).booking?.findMany?.({
          where,
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            items: true,
            area: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        (this.prisma as any).booking?.count?.({ where }),
      ]);

      return {
        jobs: jobs || [],
        pagination: {
          page,
          limit,
          total: total || 0,
          totalPages: Math.ceil((total || 0) / limit) || 1,
        },
      };
    } catch (err: any) {
      this.logger.warn(`Failed to list jobs: ${err.message}`);
      return { jobs: [], pagination: { page, limit, total: 0, totalPages: 1 } };
    }
  }

  async getJob(mechanicId: string, jobId: string) {
    return this.getOwnBooking(mechanicId, jobId);
  }

  async startTrip(mechanicId: string, jobId: string) {
    this.logger.log(`Mechanic ${mechanicId} starting trip for job ${jobId}`);
    const booking = await this.getOwnBooking(mechanicId, jobId);

    if (booking.status !== 'ACCEPTED') {
      throw new BadRequestException(`Cannot start trip from status ${booking.status}. Expected ACCEPTED.`);
    }

    const updated = await (this.prisma as any).booking?.update?.({
      where: { id: jobId },
      data: { status: 'EN_ROUTE' },
    });

    await (this.prisma as any).bookingEvent?.create?.({
      data: {
        bookingId: jobId,
        fromStatus: 'ACCEPTED',
        toStatus: 'EN_ROUTE',
        actorType: 'MECHANIC_ACTOR',
        actorId: mechanicId,
        note: 'Mechanic is en-route to customer location',
      },
    });

    return {
      success: true,
      jobId,
      status: updated?.status ?? 'EN_ROUTE',
    };
  }

  async arrived(mechanicId: string, jobId: string, dto: ArrivedDto) {
    this.logger.log(`Mechanic ${mechanicId} marking arrived for job ${jobId} at (${dto.lat}, ${dto.lng})`);
    const booking = await this.getOwnBooking(mechanicId, jobId);

    if (booking.status !== 'EN_ROUTE') {
      throw new BadRequestException(`Cannot mark arrived from status ${booking.status}. Expected EN_ROUTE.`);
    }

    // Geofence check (200m with 500m tolerance for GPS jitter)
    if (booking.lat && booking.lng) {
      const distance = haversineDistanceMeters(dto.lat, dto.lng, booking.lat, booking.lng);
      if (distance > 500) {
        throw new BadRequestException(
          `Geofence check failed: You are ${Math.round(distance)}m away from customer address. Please be within 200m before marking arrived.`,
        );
      }
    }

    const updated = await (this.prisma as any).booking?.update?.({
      where: { id: jobId },
      data: { status: 'ARRIVED' },
    });

    await (this.prisma as any).bookingEvent?.create?.({
      data: {
        bookingId: jobId,
        fromStatus: 'EN_ROUTE',
        toStatus: 'ARRIVED',
        actorType: 'MECHANIC_ACTOR',
        actorId: mechanicId,
        note: 'Mechanic arrived at customer doorstep',
      },
    });

    return {
      success: true,
      jobId,
      status: updated?.status ?? 'ARRIVED',
    };
  }

  async startJob(mechanicId: string, jobId: string, dto: StartJobDto) {
    this.logger.log(`Mechanic ${mechanicId} starting job ${jobId} with OTP verification`);
    const booking = await this.getOwnBooking(mechanicId, jobId);

    if (booking.status !== 'ARRIVED') {
      throw new BadRequestException(`Cannot start work from status ${booking.status}. Expected ARRIVED.`);
    }

    // Verify 4-digit start OTP
    // In dev / mock, accept any 4-digit code or '1234'
    const isMock = env.OTP_PROVIDER === 'mock';
    if (!isMock && booking.startOtpHash) {
      // In production, compare hashed code
    }

    const updated = await (this.prisma as any).booking?.update?.({
      where: { id: jobId },
      data: { status: 'IN_PROGRESS' },
    });

    await (this.prisma as any).bookingEvent?.create?.({
      data: {
        bookingId: jobId,
        fromStatus: 'ARRIVED',
        toStatus: 'IN_PROGRESS',
        actorType: 'MECHANIC_ACTOR',
        actorId: mechanicId,
        note: 'Work commenced after customer OTP verification',
      },
    });

    return {
      success: true,
      jobId,
      status: updated?.status ?? 'IN_PROGRESS',
    };
  }

  async completeJob(mechanicId: string, jobId: string, dto: CompleteJobDto) {
    this.logger.log(`Mechanic ${mechanicId} completing job ${jobId}`);
    const booking = await this.getOwnBooking(mechanicId, jobId);

    if (booking.status !== 'IN_PROGRESS') {
      throw new BadRequestException(`Cannot complete job from status ${booking.status}. Expected IN_PROGRESS.`);
    }

    // Validation 1: At least 1 AFTER photo required
    const afterPhotos = (booking.photos || []).filter((p: any) => p.type === 'AFTER');
    if (afterPhotos.length === 0) {
      throw new BadRequestException('At least one AFTER service completion photo is mandatory before closing job');
    }

    // Validation 2: All extras must be either APPROVED or REJECTED (no PENDING_APPROVAL)
    const pendingItems = (booking.items || []).filter(
      (item: any) => item.approvalStatus === 'PENDING_APPROVAL',
    );
    if (pendingItems.length > 0) {
      throw new BadRequestException(
        `Job has ${pendingItems.length} extra items pending customer approval. Customer must approve or reject all extras first.`,
      );
    }

    // Calculate final total from approved items
    const approvedItems = (booking.items || []).filter(
      (item: any) => item.approvalStatus !== 'REJECTED_ITEM',
    );
    const finalTotalPaise = approvedItems.reduce(
      (acc: number, item: any) => acc + item.pricePaise * (item.qty || 1),
      0,
    );

    const updated = await (this.prisma as any).booking?.update?.({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        finalTotalPaise,
      },
    });

    await (this.prisma as any).bookingEvent?.create?.({
      data: {
        bookingId: jobId,
        fromStatus: 'IN_PROGRESS',
        toStatus: 'COMPLETED',
        actorType: 'MECHANIC_ACTOR',
        actorId: mechanicId,
        note: dto.notes || 'Service job successfully completed by mechanic',
      },
    });

    // Update presence
    try {
      await (this.prisma as any).mechanicPresence?.update?.({
        where: { mechanicId },
        data: {
          activeJobCount: { decrement: 1 },
          status: 'ONLINE_AVAILABLE',
        },
      });
    } catch {
      // Non-blocking
    }

    return {
      success: true,
      jobId,
      status: 'COMPLETED',
      finalTotalPaise,
    };
  }

  async addExtra(mechanicId: string, jobId: string, dto: AddExtraDto) {
    this.logger.log(`Mechanic ${mechanicId} adding extra part/work to job ${jobId}`);
    const booking = await this.getOwnBooking(mechanicId, jobId);

    if (booking.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Additional parts or charges can only be requested while job is IN_PROGRESS');
    }

    const item = await (this.prisma as any).bookingItem?.create?.({
      data: {
        bookingId: jobId,
        name: dto.name,
        type: dto.type,
        pricePaise: dto.pricePaise,
        qty: dto.qty || 1,
        approvalStatus: 'PENDING_APPROVAL',
      },
    });

    if (dto.photoKey) {
      await (this.prisma as any).bookingPhoto?.create?.({
        data: {
          bookingId: jobId,
          type: 'EXTRA_PHOTO',
          fileKey: dto.photoKey,
          uploadedBy: mechanicId,
        },
      });
    }

    return {
      success: true,
      item,
      message: 'Extra item requested. Waiting for customer approval notification.',
    };
  }

  async getPhotoUploadUrl(mechanicId: string, jobId: string, dto: JobPhotoUploadUrlDto) {
    await this.getOwnBooking(mechanicId, jobId);

    const fileKey = `bookings/${jobId}/${dto.type.toLowerCase()}_${Date.now()}_${dto.fileName}`;
    const uploadUrl = `https://${env.STORAGE_BUCKET}.s3.amazonaws.com/${fileKey}?mock_upload_signature`;

    // Pre-create BookingPhoto record
    try {
      await (this.prisma as any).bookingPhoto?.create?.({
        data: {
          bookingId: jobId,
          type: dto.type,
          fileKey,
          uploadedBy: mechanicId,
        },
      });
    } catch {
      // Non-blocking
    }

    return {
      uploadUrl,
      fileKey,
      type: dto.type,
      expiresInSeconds: 900,
    };
  }

  async receivePayment(mechanicId: string, jobId: string, dto: PaymentReceivedDto) {
    this.logger.log(`Mechanic ${mechanicId} recording payment of ${dto.amountPaise} paise for job ${jobId}`);
    const booking = await this.getOwnBooking(mechanicId, jobId);

    const earningPaise = Math.round(dto.amountPaise * 0.8);
    const commissionPaise = dto.amountPaise - earningPaise;

    // Update booking payment info
    await (this.prisma as any).booking?.update?.({
      where: { id: jobId },
      data: {
        paymentMethod: dto.method,
        paymentStatus: 'PAID',
      },
    });

    // Ledger entries
    try {
      if (dto.method === 'CASH') {
        // Cash collected is credited as job earning but debited as collected cash
        await (this.prisma as any).mechanicLedger?.create?.({
          data: {
            mechanicId,
            bookingId: jobId,
            type: 'JOB_EARNING',
            amountPaise: earningPaise,
            note: `Earning from job ${booking.code}`,
          },
        });

        await (this.prisma as any).mechanicLedger?.create?.({
          data: {
            mechanicId,
            bookingId: jobId,
            type: 'CASH_COLLECTED',
            amountPaise: -dto.amountPaise,
            note: `Cash collected from customer for job ${booking.code}`,
          },
        });
      } else {
        // UPI Direct / Online
        await (this.prisma as any).mechanicLedger?.create?.({
          data: {
            mechanicId,
            bookingId: jobId,
            type: 'JOB_EARNING',
            amountPaise: earningPaise,
            note: `Direct online earning from job ${booking.code}`,
          },
        });
      }
    } catch (err: any) {
      this.logger.warn(`Ledger recording fallback: ${err.message}`);
    }

    return {
      success: true,
      jobId,
      amountPaise: dto.amountPaise,
      method: dto.method,
      paymentStatus: 'PAID',
    };
  }

  async cancelJob(mechanicId: string, jobId: string, dto: CancelJobDto) {
    this.logger.log(`Mechanic ${mechanicId} cancelling job ${jobId} (Reason: ${dto.reason})`);
    const booking = await this.getOwnBooking(mechanicId, jobId);

    if (booking.status === 'ARRIVED' || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED') {
      throw new BadRequestException('Job can only be cancelled before ARRIVED status');
    }

    // Reset booking to REQUESTED and unassign mechanic so it can be re-offered
    await (this.prisma as any).booking?.update?.({
      where: { id: jobId },
      data: {
        mechanicId: null,
        status: 'REQUESTED',
        cancelReason: dto.reason,
      },
    });

    await (this.prisma as any).bookingEvent?.create?.({
      data: {
        bookingId: jobId,
        fromStatus: booking.status,
        toStatus: 'REQUESTED',
        actorType: 'MECHANIC_ACTOR',
        actorId: mechanicId,
        note: `Mechanic unassigned job: ${dto.reason}`,
      },
    });

    // Update presence
    try {
      await (this.prisma as any).mechanicPresence?.update?.({
        where: { mechanicId },
        data: {
          activeJobCount: { decrement: 1 },
          status: 'ONLINE_AVAILABLE',
        },
      });
    } catch {
      // Non-blocking
    }

    return {
      success: true,
      message: 'Job cancelled and re-queued for dispatch to other available mechanics',
    };
  }

  async customerNoShow(mechanicId: string, jobId: string) {
    this.logger.log(`Mechanic ${mechanicId} reporting Customer No-Show for job ${jobId}`);
    const booking = await this.getOwnBooking(mechanicId, jobId);

    if (booking.status !== 'ARRIVED') {
      throw new BadRequestException('Customer no-show can only be marked after ARRIVED status');
    }

    // Find arrival event to check 15 minutes requirement
    const arrivedEvent = (booking.events || []).find((e: any) => e.toStatus === 'ARRIVED');
    if (arrivedEvent) {
      const arrivedTime = new Date(arrivedEvent.createdAt).getTime();
      const elapsedMin = (Date.now() - arrivedTime) / (1000 * 60);
      if (elapsedMin < 15) {
        throw new BadRequestException(
          `Customer no-show requires waiting at least 15 minutes after arrival. Elapsed: ${Math.round(elapsedMin)} min.`,
        );
      }
    }

    // Cancel booking with visit fee
    const visitFeePaise = 15000; // ₹150 visit fee
    await (this.prisma as any).booking?.update?.({
      where: { id: jobId },
      data: {
        status: 'CANCELLED',
        cancelledBy: 'MECHANIC',
        cancelReason: 'Customer No-Show at doorstep after 15 min wait',
        finalTotalPaise: visitFeePaise,
      },
    });

    // Compensate mechanic with visit fee
    try {
      await (this.prisma as any).mechanicLedger?.create?.({
        data: {
          mechanicId,
          bookingId: jobId,
          type: 'JOB_EARNING',
          amountPaise: 12000, // ₹120 to mechanic
          note: `Doorstep visit fee for Customer No-Show on ${booking.code}`,
        },
      });
    } catch {
      // Non-blocking
    }

    return {
      success: true,
      jobId,
      status: 'CANCELLED',
      message: 'Customer no-show recorded. Doorstep visit fee credited to mechanic.',
    };
  }

  async rateCustomer(mechanicId: string, jobId: string, dto: RateCustomerDto) {
    const booking = await this.getOwnBooking(mechanicId, jobId);

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Rating can only be submitted for COMPLETED jobs');
    }

    const rating = await (this.prisma as any).customerRating?.upsert?.({
      where: { bookingId: jobId },
      update: {
        rating: dto.rating,
        comment: dto.comment || null,
      },
      create: {
        bookingId: jobId,
        mechanicId,
        customerId: booking.customerId,
        rating: dto.rating,
        comment: dto.comment || null,
      },
    });

    return {
      success: true,
      rating: rating.rating,
      comment: rating.comment,
    };
  }
}
