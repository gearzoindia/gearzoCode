import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  GoOnlineDto,
  UpdateLocationDto,
  SetAvailabilityDto,
} from './dto/presence.dto';
import { env } from '../../config/env';

const MAX_NEGATIVE_BALANCE_PAISE = -50000; // -₹500 commission dues limit

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async goOnline(mechanicId: string, dto: GoOnlineDto) {
    this.logger.log(`Mechanic ${mechanicId} going ONLINE at (${dto.lat}, ${dto.lng})`);

    const mechanic = await (this.prisma as any).mechanic?.findUnique?.({
      where: { id: mechanicId },
      select: { status: true },
    });

    if (mechanic?.status !== 'APPROVED' && env.OTP_PROVIDER !== 'mock' && env.NODE_ENV !== 'development') {
      throw new ForbiddenException('Only approved mechanics can go online and receive jobs');
    }

    // Check outstanding dues from ledger
    try {
      const aggregate = await (this.prisma as any).mechanicLedger?.aggregate?.({
        where: { mechanicId },
        _sum: { amountPaise: true },
      });
      const balancePaise = aggregate?._sum?.amountPaise ?? 0;

      if (balancePaise < MAX_NEGATIVE_BALANCE_PAISE) {
        throw new BadRequestException(
          `Cannot go online: Outstanding platform dues exceed allowed limit of ₹500. Current dues: ₹${Math.abs(balancePaise / 100).toFixed(2)}. Please clear dues in Earnings.`,
        );
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      this.logger.warn(`Ledger dues check non-blocking error: ${err.message}`);
    }

    // Update presence
    const presence = await (this.prisma as any).mechanicPresence?.upsert?.({
      where: { mechanicId },
      update: {
        status: 'ONLINE_AVAILABLE',
        lastLocationLat: dto.lat,
        lastLocationLng: dto.lng,
        lastSeenAt: new Date(),
      },
      create: {
        mechanicId,
        status: 'ONLINE_AVAILABLE',
        lastLocationLat: dto.lat,
        lastLocationLng: dto.lng,
        lastSeenAt: new Date(),
      },
    });

    return {
      status: 'ONLINE_AVAILABLE',
      lat: dto.lat,
      lng: dto.lng,
      lastSeenAt: presence?.lastSeenAt ?? new Date(),
    };
  }

  async goOffline(mechanicId: string) {
    this.logger.log(`Mechanic ${mechanicId} going OFFLINE`);

    // Check if active job in progress
    try {
      const activeJob = await (this.prisma as any).booking?.findFirst?.({
        where: {
          mechanicId,
          status: { in: ['EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'] },
        },
      });

      if (activeJob) {
        throw new BadRequestException(
          `Cannot go offline while on active job ${activeJob.code}. Complete or cancel the job first.`,
        );
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
    }

    const presence = await (this.prisma as any).mechanicPresence?.upsert?.({
      where: { mechanicId },
      update: {
        status: 'OFFLINE',
        lastSeenAt: new Date(),
      },
      create: {
        mechanicId,
        status: 'OFFLINE',
        lastSeenAt: new Date(),
      },
    });

    return {
      status: 'OFFLINE',
      lastSeenAt: presence?.lastSeenAt ?? new Date(),
    };
  }

  async updateLocation(mechanicId: string, dto: UpdateLocationDto) {
    const presence = await (this.prisma as any).mechanicPresence?.upsert?.({
      where: { mechanicId },
      update: {
        lastLocationLat: dto.lat,
        lastLocationLng: dto.lng,
        lastSeenAt: new Date(),
      },
      create: {
        mechanicId,
        status: 'ONLINE_AVAILABLE',
        lastLocationLat: dto.lat,
        lastLocationLng: dto.lng,
        lastSeenAt: new Date(),
      },
    });

    return {
      success: true,
      status: presence?.status ?? 'ONLINE_AVAILABLE',
      lastSeenAt: presence?.lastSeenAt ?? new Date(),
    };
  }

  async getAvailability(mechanicId: string) {
    try {
      const [weeklyHours, leaves] = await Promise.all([
        (this.prisma as any).mechanicAvailability?.findMany?.({
          where: { mechanicId },
          orderBy: { weekday: 'asc' },
        }),
        (this.prisma as any).mechanicLeave?.findMany?.({
          where: {
            mechanicId,
            date: { gte: new Date() },
          },
          orderBy: { date: 'asc' },
        }),
      ]);

      return {
        weeklyHours: weeklyHours || [],
        leaves: (leaves || []).map((l: any) => l.date),
      };
    } catch (err: any) {
      this.logger.warn(`Failed to fetch availability: ${err.message}`);
      return {
        weeklyHours: [],
        leaves: [],
      };
    }
  }

  async setAvailability(mechanicId: string, dto: SetAvailabilityDto) {
    this.logger.log(`Updating availability for mechanic ${mechanicId}`);

    try {
      // Upsert weekly hours
      for (const wh of dto.weeklyHours) {
        await (this.prisma as any).mechanicAvailability?.upsert?.({
          where: {
            mechanicId_weekday: {
              mechanicId,
              weekday: wh.weekday,
            },
          },
          update: {
            startTime: wh.startTime,
            endTime: wh.endTime,
          },
          create: {
            mechanicId,
            weekday: wh.weekday,
            startTime: wh.startTime,
            endTime: wh.endTime,
          },
        });
      }

      // Upsert leave days
      if (dto.leaveDates && dto.leaveDates.length > 0) {
        for (const dateStr of dto.leaveDates) {
          const d = new Date(dateStr);
          await (this.prisma as any).mechanicLeave?.upsert?.({
            where: {
              mechanicId_date: {
                mechanicId,
                date: d,
              },
            },
            update: {},
            create: {
              mechanicId,
              date: d,
            },
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Availability persistence error: ${err.message}`);
    }

    return this.getAvailability(mechanicId);
  }
}
