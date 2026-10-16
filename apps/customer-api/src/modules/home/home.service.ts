import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { HomeQueryDto } from './dto/home.dto';

@Injectable()
export class HomeService {
  private readonly logger = new Logger(HomeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHomeData(customerId?: string, query?: HomeQueryDto) {
    let greetingName = 'there';
    let defaultAddress: any = null;
    let selectedVehicle: any = null;

    if (customerId) {
      try {
        const customer = await (this.prisma as any).customer?.findUnique?.({
          where: { id: customerId },
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
            vehicles: {
              where: { isDefault: true, deletedAt: null },
              take: 1,
              include: { brand: true, model: true },
            },
          },
        });

        if (customer) {
          if (customer.name) {
            greetingName = customer.name.split(' ')[0];
          }
          if (customer.addresses?.[0]) {
            defaultAddress = customer.addresses[0];
          } else {
            // Find any address
            const anyAddr = await (this.prisma as any).customerAddress?.findFirst?.({
              where: { customerId },
              orderBy: { createdAt: 'desc' },
            });
            if (anyAddr) defaultAddress = anyAddr;
          }

          if (customer.vehicles?.[0]) {
            selectedVehicle = customer.vehicles[0];
          } else {
            // Find any vehicle
            const anyVeh = await (this.prisma as any).customerVehicle?.findFirst?.({
              where: { customerId, deletedAt: null },
              orderBy: { createdAt: 'desc' },
              include: { brand: true, model: true },
            });
            if (anyVeh) selectedVehicle = anyVeh;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Failed to fetch user home context: ${err.message}`);
      }
    }

    // Check serviceability
    let serviceable = true;
    try {
      const activeAreas = await (this.prisma as any).jurisdiction?.count?.({
        where: { level: 'AREA', isActive: true },
      });
      serviceable = (activeAreas ?? 1) > 0;
    } catch {
      serviceable = true;
    }

    // Service Categories for primary tiles
    let primaryServiceTiles: any[] = [];
    try {
      const categories = await (this.prisma as any).serviceCategory?.findMany?.({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      });
      primaryServiceTiles = categories || [];
    } catch {
      primaryServiceTiles = [
        { id: 'cat_gen', name: 'General Service', icon: 'wrench', isEmergency: false },
        { id: 'cat_rep', name: 'Repairs & Inspection', icon: 'tools', isEmergency: false },
        { id: 'cat_sos', name: 'Emergency RSA', icon: 'alert-triangle', isEmergency: true },
        { id: 'cat_wash', name: 'Car Wash & Spa', icon: 'sparkles', isEmergency: false },
        { id: 'cat_tyres', name: 'Tyres & Wheel Care', icon: 'disc', isEmergency: false },
        { id: 'cat_bat', name: 'Battery Service', icon: 'zap', isEmergency: false },
      ];
    }

    // Quick services
    let quickServices: any[] = [];
    try {
      const services = await (this.prisma as any).services?.findMany?.({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 4,
        include: { category: true },
      });
      quickServices = services || [];
    } catch {
      quickServices = [
        { id: 'srv_1', name: 'Periodic Engine Oil Change', durationMin: 60, priceType: 'STARTING_FROM' },
        { id: 'srv_2', name: 'Brake Pad Replacement', durationMin: 45, priceType: 'STARTING_FROM' },
        { id: 'srv_3', name: 'Jumpstart Assistance', durationMin: 30, priceType: 'FIXED' },
        { id: 'srv_4', name: 'Flat Tyre Puncture Fix', durationMin: 25, priceType: 'FIXED' },
      ];
    }

    const promoBanners = [
      {
        id: 'banner_1',
        title: 'Monsoon Car Checkup',
        subtitle: 'Get 25-point safety check with wiper blades replacement',
        discount: 'Flat ₹300 OFF',
        code: 'MONSOON300',
        imageUrl: 'https://cdn.gearzo.in/banners/monsoon-banner.png',
        actionUrl: 'gearzo://services?category=periodic',
      },
      {
        id: 'banner_2',
        title: 'GearZo Roadside Assistance',
        subtitle: '24/7 on-demand breakdown dispatch in under 30 mins',
        discount: 'Starting @ ₹299',
        code: 'FASTSOS',
        imageUrl: 'https://cdn.gearzo.in/banners/rsa-banner.png',
        actionUrl: 'gearzo://services?category=emergency',
      },
    ];

    const carServiceCta = {
      title: 'Schedule Doorstep Service',
      subtitle: 'Certified mechanics come to your doorstep with authentic spare parts',
      buttonText: 'Book Service Now',
      deepLink: 'gearzo://booking/create',
    };

    const promise = {
      title: 'The GearZo Assurance',
      points: [
        {
          title: 'Verified & Background-Checked',
          description: 'Top-rated master mechanics with KYC approval',
          icon: 'shield-check',
        },
        {
          title: 'Upfront Transparent Pricing',
          description: 'No hidden estimates. Approve extra parts before fitting',
          icon: 'currency-inr',
        },
        {
          title: '30-Day / 1000 KM Warranty',
          description: 'Complete peace of mind on all doorstep repairs',
          icon: 'award',
        },
      ],
    };

    return {
      greetingName,
      address: defaultAddress
        ? {
            id: defaultAddress.id,
            label: defaultAddress.label,
            line1: defaultAddress.line1,
            line2: defaultAddress.line2,
            landmark: defaultAddress.landmark,
            lat: defaultAddress.lat,
            lng: defaultAddress.lng,
          }
        : null,
      serviceable,
      selectedVehicle: selectedVehicle
        ? {
            id: selectedVehicle.id,
            type: selectedVehicle.type,
            brand: selectedVehicle.brand?.name ?? '',
            model: selectedVehicle.model?.name ?? selectedVehicle.customModel ?? '',
            regNumber: selectedVehicle.regNumber ?? '',
            fuelType: selectedVehicle.fuelType,
          }
        : null,
      unreadNotificationCount: 0,
      promoBanners,
      primaryServiceTiles,
      quickServices,
      carServiceCta,
      promise,
    };
  }

  async getAppConfig() {
    let minVersion = '1.0.0';
    let latestVersion = '1.0.0';
    let features: Record<string, boolean> = {
      onlinePayment: true,
      instantBooking: true,
      subscriptionPlans: true,
      walletSystem: true,
      doorstepTowing: true,
    };
    let maintenance = {
      underMaintenance: false,
      message: '',
    };

    try {
      const appVer = await (this.prisma as any).appVersion?.findFirst?.({
        where: { app: 'CUSTOMER_APP' },
        orderBy: { updatedAt: 'desc' },
      });
      if (appVer) {
        minVersion = appVer.minSupportedVersion;
        latestVersion = appVer.latestVersion;
        if (appVer.message) {
          maintenance.message = appVer.message;
        }
      }

      const flags = await (this.prisma as any).featureFlag?.findMany?.({
        where: { enabled: true },
      });
      if (flags && flags.length > 0) {
        for (const f of flags) {
          features[f.key] = f.enabled;
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed to fetch app configuration: ${err.message}`);
    }

    return {
      minVersion,
      latestVersion,
      features,
      maintenance,
      supportPhone: '+918000123456',
      supportEmail: 'support@gearzo.in',
      termsUrl: 'https://gearzo.in/terms',
      privacyUrl: 'https://gearzo.in/privacy',
    };
  }
}
