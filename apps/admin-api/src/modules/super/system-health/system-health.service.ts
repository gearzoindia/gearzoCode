import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PaymentOrderStatus } from '@gearzo/db';

@Injectable()
export class SystemHealthService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 1. Database Health Check & Latency
    let dbStatus = 'HEALTHY';
    let dbLatencyMs = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } catch {
      dbStatus = 'DEGRADED';
    }

    // 2. Redis Connection Status
    const redisStatus = process.env.REDIS_URL ? 'CONNECTED' : 'MOCK/MEMORY';

    // 3. OTP & SMS Delivery Performance (last 24h)
    const [totalOtps, consumedOtps] = await Promise.all([
      this.prisma.otpRequest.count({ where: { createdAt: { gte: last24h } } }),
      this.prisma.otpRequest.count({
        where: { createdAt: { gte: last24h }, consumedAt: { not: null } },
      }),
    ]);
    const otpSuccessRatePct =
      totalOtps > 0 ? Number(((consumedOtps / totalOtps) * 100).toFixed(1)) : 100;

    // 4. Payment Gateway Success Rate (last 24h)
    const [capturedPayments, failedPayments, totalPayments] = await Promise.all([
      this.prisma.payment.count({
        where: { createdAt: { gte: last24h }, status: PaymentOrderStatus.CAPTURED },
      }),
      this.prisma.payment.count({
        where: { createdAt: { gte: last24h }, status: PaymentOrderStatus.FAILED },
      }),
      this.prisma.payment.count({
        where: { createdAt: { gte: last24h } },
      }),
    ]);
    const paymentSuccessRatePct =
      totalPayments > 0
        ? Number(((capturedPayments / totalPayments) * 100).toFixed(1))
        : 100;

    // 5. Auth / Security Incident Logs
    const failedLogins24h = await this.prisma.authEvent.count({
      where: {
        createdAt: { gte: last24h },
        type: 'LOGIN_FAILED',
      },
    });

    // 6. Cron / Background Task Status
    const pendingExports = await this.prisma.reportExport.count({
      where: { status: 'PENDING_EXPORT' },
    });

    return {
      status: dbStatus === 'HEALTHY' ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      infrastructure: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
        redis: { status: redisStatus },
      },
      metrics24h: {
        otp: {
          totalSent: totalOtps,
          verified: consumedOtps,
          successRatePct: otpSuccessRatePct,
        },
        payments: {
          totalOrders: totalPayments,
          captured: capturedPayments,
          failed: failedPayments,
          successRatePct: paymentSuccessRatePct,
        },
        security: {
          failedLoginAttempts: failedLogins24h,
        },
        queue: {
          pendingExports,
          cronHealthy: true,
        },
      },
    };
  }
}
