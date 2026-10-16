import { Module } from '@nestjs/common';
import { JurisdictionsModule } from './jurisdictions/jurisdictions.module';
import { CatalogueModule } from './catalogue/catalogue.module';
import { PricingModule } from './pricing/pricing.module';
import { VehiclesMasterModule } from './vehicles-master/vehicles-master.module';
import { CommissionModule } from './commission/commission.module';
import { FeesModule } from './fees/fees.module';
import { SettingsModule } from './settings/settings.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { AppVersionsModule } from './app-versions/app-versions.module';
import { LegalDocsModule } from './legal-docs/legal-docs.module';
import { SystemHealthModule } from './system-health/system-health.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { PaymentPoliciesModule } from './payment-policies/payment-policies.module';
import { IncentivesModule } from './incentives/incentives.module';
import { DispatchModule } from './dispatch/dispatch.module';

@Module({
  imports: [
    JurisdictionsModule,
    CatalogueModule,
    PricingModule,
    VehiclesMasterModule,
    CommissionModule,
    FeesModule,
    SettingsModule,
    FeatureFlagsModule,
    AppVersionsModule,
    LegalDocsModule,
    SystemHealthModule,
    MaintenanceModule,
    PaymentPoliciesModule,
    IncentivesModule,
    DispatchModule,
  ],
  exports: [
    JurisdictionsModule,
    CatalogueModule,
    PricingModule,
    VehiclesMasterModule,
    CommissionModule,
    FeesModule,
    SettingsModule,
    FeatureFlagsModule,
    AppVersionsModule,
    LegalDocsModule,
    SystemHealthModule,
    MaintenanceModule,
    PaymentPoliciesModule,
    IncentivesModule,
    DispatchModule,
  ],
})
export class SuperModule {}
