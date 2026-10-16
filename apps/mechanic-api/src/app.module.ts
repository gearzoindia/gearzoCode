import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { PresenceModule } from './modules/presence/presence.module';
import { OffersModule } from './modules/offers/offers.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { EarningsModule } from './modules/earnings/earnings.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    ProfileModule,
    OnboardingModule,
    PresenceModule,
    OffersModule,
    JobsModule,
    EarningsModule,
  ],
})
export class AppModule {}
