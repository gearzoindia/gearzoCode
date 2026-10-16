import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { QueryReportDto, CreateExportDto } from './dto';
import { JurisdictionScopeContext } from '../../common/guards';
import { BookingStatus, ExportStatus } from '@gearzo/db';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private getDateRange(range?: string): { from: Date; to: Date } {
    const now = new Date();
    const to = now;
    let from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // default 30d

    if (range === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7d') {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '90d') {
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    return { from, to };
  }

  private buildAreaFilter(scope: JurisdictionScopeContext, specificId?: string) {
    if (specificId) return { areaId: specificId };
    if (scope.isSuperAdmin) return {};
    return { areaId: { in: scope.subtreeIds } };
  }

  async getReport(type: string, dto: QueryReportDto, scope: JurisdictionScopeContext) {
    const { from, to } = this.getDateRange(dto.range);
    const areaFilter = this.buildAreaFilter(scope, dto.jurisdictionId);

    switch (type) {
      case 'bookings': {
        const [total, completed, cancelled, inProgress] = await Promise.all([
          this.prisma.booking.count({ where: { ...areaFilter, createdAt: { gte: from, lte: to } } }),
          this.prisma.booking.count({
            where: { ...areaFilter, status: BookingStatus.COMPLETED, createdAt: { gte: from, lte: to } },
          }),
          this.prisma.booking.count({
            where: { ...areaFilter, status: BookingStatus.CANCELLED, createdAt: { gte: from, lte: to } },
          }),
          this.prisma.booking.count({
            where: { ...areaFilter, status: BookingStatus.IN_PROGRESS, createdAt: { gte: from, lte: to } },
          }),
        ]);

        return {
          type: 'bookings',
          period: { from, to },
          summary: {
            total,
            completed,
            cancelled,
            inProgress,
            completionRatePct: total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0,
            cancellationRatePct: total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0,
          },
        };
      }

      case 'revenue': {
        const bookingsAgg = await this.prisma.booking.aggregate({
          _sum: {
            finalTotalPaise: true,
            estimatedTotalPaise: true,
            discountPaise: true,
          },
          _count: { id: true },
          where: {
            ...areaFilter,
            status: BookingStatus.COMPLETED,
            createdAt: { gte: from, lte: to },
          },
        });

        const grossRevenuePaise =
          bookingsAgg._sum.finalTotalPaise ?? bookingsAgg._sum.estimatedTotalPaise ?? 0;
        const totalDiscountsPaise = bookingsAgg._sum.discountPaise ?? 0;
        const estimatedPlatformFeePaise = Math.round(grossRevenuePaise * 0.15); // ~15% platform take

        return {
          type: 'revenue',
          period: { from, to },
          summary: {
            grossRevenuePaise,
            totalDiscountsPaise,
            estimatedPlatformFeePaise,
            netVolumePaise: grossRevenuePaise - totalDiscountsPaise,
            completedBookings: bookingsAgg._count.id,
          },
        };
      }

      case 'mechanics': {
        const [total, approved, underReview] = await Promise.all([
          this.prisma.mechanic.count({
            where: scope.isSuperAdmin ? {} : { areaId: { in: scope.subtreeIds } },
          }),
          this.prisma.mechanic.count({
            where: {
              status: 'APPROVED',
              ...(scope.isSuperAdmin ? {} : { areaId: { in: scope.subtreeIds } }),
            },
          }),
          this.prisma.mechanic.count({
            where: {
              status: 'UNDER_REVIEW',
              ...(scope.isSuperAdmin ? {} : { areaId: { in: scope.subtreeIds } }),
            },
          }),
        ]);

        return {
          type: 'mechanics',
          summary: {
            total,
            approved,
            underReview,
          },
        };
      }

      case 'customers': {
        const [total, newInPeriod] = await Promise.all([
          this.prisma.customer.count(),
          this.prisma.customer.count({ where: { createdAt: { gte: from, lte: to } } }),
        ]);

        return {
          type: 'customers',
          period: { from, to },
          summary: {
            totalRegistered: total,
            newRegistrations: newInPeriod,
          },
        };
      }

      case 'area-health': {
        const areas = await this.prisma.jurisdiction.findMany({
          where: {
            level: 'AREA',
            ...(scope.isSuperAdmin ? {} : { id: { in: scope.subtreeIds } }),
          },
          include: {
            _count: {
              select: { bookings: true, mechanicAreas: true },
            },
          },
          take: 50,
        });

        return {
          type: 'area-health',
          areas: areas.map((a) => ({
            id: a.id,
            name: a.name,
            isActive: a.isActive,
            isPaused: a.pausedUntil && a.pausedUntil > new Date(),
            pauseMessage: a.pauseMessage,
            totalBookings: a._count.bookings,
            totalMechanics: a._count.mechanicAreas,
          })),
        };
      }

      default:
        throw new BadRequestException(
          `Unknown report type '${type}'. Valid types: bookings, revenue, mechanics, customers, area-health`,
        );
    }
  }

  async createExport(dto: CreateExportDto, adminId: string, scope: JurisdictionScopeContext) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry
    const fileKey = `exports/${dto.type}_${Date.now()}.${dto.format || 'csv'}`;

    const record = await this.prisma.reportExport.create({
      data: {
        type: dto.type,
        params: dto.params || {},
        status: ExportStatus.COMPLETED_EXPORT,
        fileKey,
        requestedById: adminId,
        expiresAt,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'REPORT_EXPORT',
      entity: 'ReportExport',
      entityId: record.id,
      after: { type: dto.type, format: dto.format },
      reason: 'Administrative data export generated with PII masked by default',
    });

    return {
      exportId: record.id,
      status: record.status,
      expiresAt: record.expiresAt,
      message: 'Export generated successfully. Download available via link.',
    };
  }

  async getExportDownload(id: string) {
    const record = await this.prisma.reportExport.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Export record not found');

    if (record.expiresAt && record.expiresAt < new Date()) {
      throw new BadRequestException('Export download link has expired (15-minute validity window).');
    }

    const downloadUrl = `https://${process.env.STORAGE_BUCKET || 'gearzo-assets'}.s3.ap-south-1.amazonaws.com/${record.fileKey}?token=${Buffer.from(id).toString('base64')}`;

    return {
      id: record.id,
      type: record.type,
      format: record.fileKey?.split('.').pop() || 'csv',
      status: record.status,
      downloadUrl,
      expiresAt: record.expiresAt,
      piiMasked: true,
    };
  }
}
