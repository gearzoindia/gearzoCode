import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { CommonAuditModule } from './common/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { MechanicsModule } from './modules/mechanics/mechanics.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { AdminsModule } from './modules/admins/admins.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BroadcastsModule } from './modules/broadcasts/broadcasts.module';
import { AreasModule } from './modules/areas/areas.module';
import { AuditModule } from './modules/audit/audit.module';
import { SuperModule } from './modules/super/super.module';

@Module({
  imports: [
    // Stricter rate limiting for administrative API: 60 requests per minute
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    CommonAuditModule,
    AuthModule,
    DashboardModule,
    BookingsModule,
    MechanicsModule,
    CustomersModule,
    DisputesModule,
    FinanceModule,
    ApprovalsModule,
    AdminsModule,
    ReportsModule,
    BroadcastsModule,
    AreasModule,
    AuditModule,
    SuperModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
