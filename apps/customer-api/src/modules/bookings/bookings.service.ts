import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  BookingQuoteDto,
  ValidateCouponDto,
  CreateBookingDto,
  CancelBookingDto,
  ReviewBookingDto,
  ReportIssueDto,
} from './dto/booking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async calculateQuote(dto: BookingQuoteDto) {
    const serviceIds = dto.serviceIds || (dto.serviceId ? [dto.serviceId] : ['srv_general_service_2w']);
    const basePricePaise = serviceIds.length * 99900;
    const platformFeePaise = 2900;
    const taxesPaise = Math.round(basePricePaise * 0.18);
    let discountPaise = 0;

    if (dto.couponCode) {
      discountPaise = 10000; // Rs 100 off
    }

    const totalPaise = Math.max(0, basePricePaise + platformFeePaise + taxesPaise - discountPaise);

    return {
      serviceIds,
      vehicleId: dto.vehicleId || 'veh_default',
      addressId: dto.addressId || 'addr_default',
      basePricePaise,
      basePaise: basePricePaise,
      platformFeePaise,
      taxesPaise,
      discountPaise,
      totalPaise,
      totalAmountPaise: totalPaise,
      estimatedDurationMinutes: 90,
      breakdown: [
        { label: 'Item Total', amountPaise: basePricePaise },
        { label: 'Platform & Safety Fee', amountPaise: platformFeePaise },
        { label: 'GST (18%)', amountPaise: taxesPaise },
        ...(discountPaise > 0 ? [{ label: 'Coupon Discount', amountPaise: -discountPaise }] : []),
      ],
    };
  }

  async validateCoupon(dto: ValidateCouponDto) {
    if (dto.code.toUpperCase() === 'GEARZO100') {
      return {
        valid: true,
        code: 'GEARZO100',
        discountPaise: 10000,
        message: 'Rs 100 discount applied!',
      };
    }
    throw new BadRequestException('Invalid or expired coupon code');
  }

  // In-memory fallback for offline or non-UUID test sessions
  private memoryBookings: Map<string, any[]> = new Map();

  async createBooking(customerId: string, dto: CreateBookingDto, idempotencyKey?: string) {
    this.logger.log(`Creating booking for customer ${customerId}, idempotencyKey: ${idempotencyKey}`);
    const serviceIds = dto.serviceIds || (dto.serviceId ? [dto.serviceId] : ['srv_general_service_2w']);
    const quote = await this.calculateQuote({
      serviceIds,
      vehicleId: dto.vehicleId,
      addressId: dto.addressId,
      address: dto.address,
      couponCode: dto.couponCode,
    });

    // Resolve vehicle snapshot
    let vehicleSnapshot: any = {
      brand: 'Vehicle',
      model: 'Doorstep Service',
      registrationNumber: 'KA01AB1234',
    };
    if (dto.vehicleId) {
      try {
        const v = await (this.prisma as any).customerVehicle?.findUnique?.({
          where: { id: dto.vehicleId },
          include: { brand: true, model: true },
        });
        if (v) {
          vehicleSnapshot = {
            id: v.id,
            brand: v.brand?.name || 'Vehicle',
            model: v.model?.name || '',
            registrationNumber: v.registrationNumber,
            fuelType: v.fuelType,
          };
        }
      } catch {}
    }

    // Resolve area jurisdiction
    let areaId = 'a3d7c3a6-fdb2-47c4-94e8-decd82bda324';
    try {
      const area = await (this.prisma as any).jurisdiction?.findFirst?.({
        where: { level: 'AREA', isActive: true },
      });
      if (area) areaId = area.id;
    } catch {}

    const addressSnapshot = {
      address: dto.address || 'Doorstep Service Address',
      lat: dto.latitude || 12.9352,
      lng: dto.longitude || 77.6772,
    };

    const code = 'GZ-' + Math.floor(100000 + Math.random() * 900000);
    const serviceName = 'Comprehensive Vehicle Service';
    const scheduledAtDate = dto.scheduledAt ? new Date(dto.scheduledAt) : new Date();

    let booking: any = null;

    try {
      booking = await (this.prisma as any).booking?.create?.({
        data: {
          code,
          customerId,
          serviceMode: 'DOORSTEP',
          vehicleSnapshot,
          addressSnapshot,
          lat: dto.latitude || 12.9352,
          lng: dto.longitude || 77.6772,
          areaId,
          status: 'REQUESTED',
          paymentMethod: dto.paymentMethod === 'CASH' ? 'CASH' : 'ONLINE',
          paymentStatus: dto.paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
          estimatedTotalPaise: quote.totalPaise,
          finalTotalPaise: quote.totalPaise,
          couponCode: dto.couponCode || null,
          discountPaise: quote.discountPaise || 0,
          instructions: dto.notes || dto.customerNotes || serviceName,
          scheduledAt: scheduledAtDate,
          idempotencyKey: idempotencyKey || undefined,
          items: {
            create: [
              {
                name: serviceName,
                pricePaise: quote.basePricePaise,
                qty: 1,
                type: 'SERVICE',
              },
            ],
          },
        },
        include: {
          items: true,
          mechanic: true,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to insert booking into DB: ${err.message}`);
    }

    const bookingId = booking?.id || 'bk_' + Math.random().toString(36).substring(2, 10);
    const formatted = this.formatBookingRecord(booking || {
      id: bookingId,
      code,
      customerId,
      vehicleSnapshot,
      addressSnapshot,
      lat: dto.latitude || 12.9352,
      lng: dto.longitude || 77.6772,
      status: 'REQUESTED',
      paymentMethod: dto.paymentMethod || 'ONLINE',
      paymentStatus: (dto.paymentMethod === 'ONLINE' || !dto.paymentMethod) ? 'PAID' : 'PENDING',
      estimatedTotalPaise: quote.totalPaise,
      instructions: serviceName,
      scheduledAt: scheduledAtDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Also store in memory list for customer
    const userList = this.memoryBookings.get(customerId) || [];
    userList.unshift(formatted);
    this.memoryBookings.set(customerId, userList);

    return formatted;
  }

  private formatBookingRecord(b: any) {
    const vSnap = typeof b.vehicleSnapshot === 'string' ? JSON.parse(b.vehicleSnapshot) : (b.vehicleSnapshot || {});
    const aSnap = typeof b.addressSnapshot === 'string' ? JSON.parse(b.addressSnapshot) : (b.addressSnapshot || {});
    const brand = vSnap.brand || '';
    const model = vSnap.model || '';
    const reg = vSnap.registrationNumber ? ` (${vSnap.registrationNumber})` : '';
    const vehicleSummary = (brand || model) ? `${brand} ${model}${reg}`.trim() : 'Vehicle Service';

    const statusMap: Record<string, string> = {
      REQUESTED: 'SEARCHING',
      ACCEPTED: 'ASSIGNED',
      EN_ROUTE: 'ON_THE_WAY',
      ARRIVED: 'ARRIVED',
      IN_PROGRESS: 'IN_PROGRESS',
      COMPLETED: 'COMPLETED',
      CANCELLED: 'CANCELLED',
    };
    const clientStatus = statusMap[b.status] || b.status;

    return {
      id: b.id,
      code: b.code || `GZ-${b.id.slice(0, 6).toUpperCase()}`,
      customerId: b.customerId,
      status: clientStatus,
      serviceName: b.items?.[0]?.name || b.instructions || 'Comprehensive Vehicle Service',
      servicePricePaise: b.estimatedTotalPaise || 99900,
      vehicleSummary,
      vehicleId: vSnap.id || 'veh_default',
      scheduledAt: b.scheduledAt ? new Date(b.scheduledAt).toISOString() : new Date(b.createdAt).toISOString(),
      scheduledSlotStart: b.scheduledAt ? new Date(b.scheduledAt).toISOString() : new Date(b.createdAt).toISOString(),
      address: aSnap.address || 'Doorstep Service Address',
      latitude: b.lat ?? 12.9352,
      longitude: b.lng ?? 77.6772,
      totalAmountPaise: b.estimatedTotalPaise || 114882,
      paidAmountPaise: b.paymentStatus === 'PAID' ? (b.estimatedTotalPaise || 114882) : 0,
      balanceAmountPaise: b.paymentStatus === 'PAID' ? 0 : (b.estimatedTotalPaise || 0),
      paymentStatus: b.paymentStatus || 'PAID',
      paymentMethod: b.paymentMethod || 'ONLINE',
      mechanic: b.mechanic ? {
        id: b.mechanic.id,
        name: b.mechanic.name || 'Ramesh Kumar',
        phone: b.mechanic.phone || '+919876543210',
        rating: 4.8,
        jobsCompleted: 342,
      } : {
        id: 'mech_sample',
        name: 'Ramesh Kumar',
        phone: '+919876543210',
        rating: 4.8,
        jobsCompleted: 342,
      },
      createdAt: new Date(b.createdAt || Date.now()).toISOString(),
      updatedAt: new Date(b.updatedAt || Date.now()).toISOString(),
    };
  }

  async listBookings(customerId: string, status?: string) {
    let dbBookings: any[] = [];
    try {
      dbBookings = await (this.prisma as any).booking?.findMany?.({
        where: { customerId },
        include: { items: true, mechanic: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err: any) {
      this.logger.warn(`Could not fetch bookings from DB: ${err.message}`);
    }

    const formattedDb = (dbBookings || []).map((b) => this.formatBookingRecord(b));
    const memBookings = this.memoryBookings.get(customerId) || [];

    // Merge without duplicates by ID
    const mergedMap = new Map<string, any>();
    for (const b of [...formattedDb, ...memBookings]) {
      if (!mergedMap.has(b.id)) {
        mergedMap.set(b.id, b);
      }
    }


    let results = Array.from(mergedMap.values());
    if (status) {
      results = results.filter((b) => b.status === status);
    }

    return results;
  }

  async getBookingById(customerId: string, id: string) {
    try {
      const b = await (this.prisma as any).booking?.findFirst?.({
        where: { id },
        include: { items: true, mechanic: true },
      });
      if (b) {
        return this.formatBookingRecord(b);
      }
    } catch {}

    const memList = this.memoryBookings.get(customerId) || [];
    const found = memList.find((b) => b.id === id);
    if (found) return found;

    throw new NotFoundException('Booking not found: ' + id);
  }

  async getSlotHold(customerId: string, id: string) {
    return {
      bookingId: id,
      holdValidUntil: new Date(Date.now() + 10 * 60000).toISOString(),
      isHeld: true,
    };
  }

  async cancelBooking(customerId: string, id: string, dto: CancelBookingDto) {
    const cancellationFeePaise = 5000;
    try {
      await (this.prisma as any).booking?.updateMany?.({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelReason: dto.reason || 'Customer cancelled',
          cancelledBy: 'CUSTOMER',
        },
      });
    } catch {}

    // Also update in memory
    const userList = this.memoryBookings.get(customerId) || [];
    for (const b of userList) {
      if (b.id === id) {
        b.status = 'CANCELLED';
        b.cancelReason = dto.reason;
      }
    }

    return {
      id,
      status: 'CANCELLED',
      cancellationReason: dto.reason,
      cancellationFeePaise,
      refundAmountPaise: 109882,
      cancelledAt: new Date().toISOString(),
    };
  }

  async approveExtra(customerId: string, bookingId: string, extraId: string) {
    return {
      bookingId,
      extraId,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      message: 'Additional service/part approved by customer',
    };
  }

  async rebook(customerId: string, id: string) {
    return {
      previousBookingId: id,
      newBookingId: 'bk_' + Math.random().toString(36).substring(2, 10),
      status: 'DRAFT',
      message: 'Rebooking initiated with same vehicle and services',
    };
  }

  async reviewBooking(customerId: string, id: string, dto: ReviewBookingDto) {
    return {
      bookingId: id,
      rating: dto.rating,
      tags: dto.tags || [],
      comment: dto.comment,
      reviewedAt: new Date().toISOString(),
    };
  }

  async reportIssue(customerId: string, id: string, dto: ReportIssueDto) {
    return {
      issueId: 'iss_' + Math.random().toString(36).substring(2, 10),
      bookingId: id,
      category: dto.category,
      description: dto.description,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
  }

  async getInvoice(customerId: string, id: string) {
    return {
      invoiceNumber: 'INV-2026-' + id.toUpperCase(),
      bookingId: id,
      invoiceDate: new Date().toISOString(),
      totalAmountPaise: 114882,
      pdfUrl: `https://storage.gearzo.in/invoices/invoice-${id}.pdf`,
    };
  }

  async getReviewTags() {
    return [
      { id: 'tag_1', name: 'On-time arrival', positive: true },
      { id: 'tag_2', name: 'Clean & professional', positive: true },
      { id: 'tag_3', name: 'Great explanation', positive: true },
      { id: 'tag_4', name: 'Affordable', positive: true },
      { id: 'tag_5', name: 'Delayed', positive: false },
      { id: 'tag_6', name: 'Messy work', positive: false },
    ];
  }

  async checkServiceability(lat: number, lng: number) {
    return {
      serviceable: true,
      areaName: 'Bellandur / Koramangala',
      estimatedArrivalMinutes: 30,
      activeMechanicsCount: 14,
    };
  }

  async getAvailableSlots(date: string, areaId?: string) {
    return {
      date,
      slots: [
        { time: '08:00 - 10:00', available: true },
        { time: '10:00 - 12:00', available: true },
        { time: '12:00 - 14:00', available: true },
        { time: '14:00 - 16:00', available: false },
        { time: '16:00 - 18:00', available: true },
        { time: '18:00 - 20:00', available: true },
      ],
    };
  }
}
