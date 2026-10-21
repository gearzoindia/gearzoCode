import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DashboardFilterDto, LiveMapDto } from './dto/dashboard.dto';
import { BookingStatus, MechanicStatus, PresenceStatus, DisputeStatus } from '@gearzo/db';
import { JurisdictionScopeContext } from '../../common/guards';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateRange(range?: string): { from: Date; to: Date } {
    const now = new Date();
    const to = now;
    let from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // start of today

    if (range === '7d') {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === '90d') {
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    return { from, to };
  }

  private buildAreaFilter(scope: JurisdictionScopeContext, specificId?: string) {
    if (specificId) {
      return { areaId: specificId };
    }
    if (scope.isSuperAdmin) {
      return {};
    }
    return { areaId: { in: scope.subtreeIds } };
  }

  async getStats(dto: DashboardFilterDto, scope: JurisdictionScopeContext) {
    const { from, to } = this.getDateRange(dto.range);
    const areaFilter = this.buildAreaFilter(scope, dto.jurisdictionId);

    // Bookings count in period
    const totalBookings = await this.prisma.booking.count({
      where: {
        ...areaFilter,
        createdAt: { gte: from, lte: to },
      },
    });

    // Active Bookings right now
    const activeBookings = await this.prisma.booking.count({
      where: {
        ...areaFilter,
        status: {
          in: [
            BookingStatus.REQUESTED,
            BookingStatus.ACCEPTED,
            BookingStatus.EN_ROUTE,
            BookingStatus.ARRIVED,
            BookingStatus.IN_PROGRESS,
          ],
        },
      },
    });

    // Revenue in paise (completed bookings in period)
    const revenueAgg = await this.prisma.booking.aggregate({
      _sum: {
        finalTotalPaise: true,
        estimatedTotalPaise: true,
      },
      where: {
        ...areaFilter,
        status: BookingStatus.COMPLETED,
        createdAt: { gte: from, lte: to },
      },
    });
    const totalRevenuePaise =
      revenueAgg._sum.finalTotalPaise ?? revenueAgg._sum.estimatedTotalPaise ?? 0;

    // Online Mechanics in scope
    const onlineMechanics = await this.prisma.mechanicPresence.count({
      where: {
        status: {
          in: [PresenceStatus.ONLINE_AVAILABLE, PresenceStatus.ONLINE_BUSY, PresenceStatus.ON_JOB],
        },
        mechanic: {
          status: MechanicStatus.APPROVED,
          ...(scope.isSuperAdmin ? {} : { areaId: { in: scope.subtreeIds } }),
        },
      },
    });

    // Pending KYC Queue in scope
    const pendingKycCount = await this.prisma.mechanic.count({
      where: {
        status: { in: [MechanicStatus.PENDING_KYC, MechanicStatus.UNDER_REVIEW] },
        ...(scope.isSuperAdmin ? {} : { areaId: { in: scope.subtreeIds } }),
      },
    });

    // Open Disputes
    const openDisputes = await this.prisma.dispute.count({
      where: {
        status: { in: [DisputeStatus.OPEN, DisputeStatus.IN_REVIEW, DisputeStatus.ESCALATED] },
        booking: areaFilter,
      },
    });

    return {
      range: dto.range || 'today',
      period: { from: from.toISOString(), to: to.toISOString() },
      metrics: {
        totalBookings,
        totalBookingsToday: totalBookings,
        activeBookings,
        totalRevenuePaise,
        revenueTodayPaise: totalRevenuePaise,
        onlineMechanics,
        activeMechanicsCount: onlineMechanics,
        pendingKycCount,
        openDisputes,
        openDisputesCount: openDisputes,
      },
      totalBookingsToday: totalBookings,
      activeMechanicsCount: onlineMechanics,
      revenueTodayPaise: totalRevenuePaise,
      openDisputesCount: openDisputes,
      pendingKycCount,
    };
  }

  async getLiveMap(dto: LiveMapDto, scope: JurisdictionScopeContext) {
    const [mechanics, bookings] = await Promise.all([
      this.getLiveMechanics(dto, scope),
      this.getLiveBookings(dto, scope),
    ]);

    const mechEntities = mechanics.map((m) => ({
      id: m.mechanicId,
      name: `${m.name} (Mechanic)`,
      type: 'mechanic' as const,
      latitude: m.lat || 12.9716,
      longitude: m.lng || 77.5946,
      status: m.status,
    }));

    const bookingEntities = bookings.map((b) => ({
      id: b.id,
      name: `Job #${b.code || b.id.slice(0, 8)}`,
      type: 'customer' as const,
      latitude: b.lat || 12.9698,
      longitude: b.lng || 77.7499,
      status: b.status,
    }));

    return [...mechEntities, ...bookingEntities];
  }

  async getLiveMechanics(dto: LiveMapDto, scope: JurisdictionScopeContext) {
    const areaFilter = this.buildAreaFilter(scope, dto.areaId);

    const presences = await this.prisma.mechanicPresence.findMany({
      where: {
        status: {
          in: [PresenceStatus.ONLINE_AVAILABLE, PresenceStatus.ONLINE_BUSY, PresenceStatus.ON_JOB],
        },
        lastLocationLat: { not: null },
        lastLocationLng: { not: null },
        mechanic: {
          status: MechanicStatus.APPROVED,
          ...areaFilter,
        },
      },
      include: {
        mechanic: {
          select: {
            id: true,
            name: true,
            phone: true,
            areaId: true,
            registrationType: true,
            profile: {
              select: {
                ratingAvg: true,
                ratingCount: true,
                serviceModes: true,
              },
            },
          },
        },
      },
      take: 200,
    });

    return presences.map((p) => ({
      mechanicId: p.mechanic.id,
      name: p.mechanic.name,
      phone: p.mechanic.phone,
      areaId: p.mechanic.areaId,
      status: p.status,
      lat: p.lastLocationLat,
      lng: p.lastLocationLng,
      lastSeenAt: p.lastSeenAt,
      ratingAvg: p.mechanic.profile?.ratingAvg || 0,
      activeJobCount: p.activeJobCount,
    }));
  }

  async getLiveBookings(dto: LiveMapDto, scope: JurisdictionScopeContext) {
    const areaFilter = this.buildAreaFilter(scope, dto.areaId);

    const bookings = await this.prisma.booking.findMany({
      where: {
        ...areaFilter,
        status: {
          in: [
            BookingStatus.REQUESTED,
            BookingStatus.ACCEPTED,
            BookingStatus.EN_ROUTE,
            BookingStatus.ARRIVED,
            BookingStatus.IN_PROGRESS,
          ],
        },
      },
      include: {
        mechanic: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return bookings.map((b) => ({
      id: b.id,
      code: b.code,
      status: b.status,
      serviceMode: b.serviceMode,
      lat: b.lat,
      lng: b.lng,
      areaId: b.areaId,
      scheduledAt: b.scheduledAt,
      estimatedTotalPaise: b.estimatedTotalPaise,
      mechanic: b.mechanic,
      createdAt: b.createdAt,
    }));
  }
}
