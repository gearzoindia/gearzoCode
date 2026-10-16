import {
  PrismaClient,
  AdminRole,
  AdminStatus,
  JurisdictionLevel,
  VehicleType,
  FuelType,
  PriceType,
  ServiceMode,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding GearZo Database ---');

  // 1. Seed City
  const city = await prisma.city.upsert({
    where: { name: 'Bengaluru' },
    update: {},
    create: {
      name: 'Bengaluru',
      isActive: true,
    },
  });
  console.log(`✅ City: ${city.name} (${city.id})`);

  // 2. Seed Jurisdiction Tree (Division -> Sub-Division -> Area)
  const division = await prisma.jurisdiction.create({
    data: {
      name: 'Bengaluru South Division',
      level: JurisdictionLevel.DIVISION,
      cityId: city.id,
      isActive: true,
    },
  });

  const subDivision = await prisma.jurisdiction.create({
    data: {
      name: 'Koramangala Sub-Division',
      level: JurisdictionLevel.SUB_DIVISION,
      parentId: division.id,
      cityId: city.id,
      isActive: true,
    },
  });

  const area = await prisma.jurisdiction.create({
    data: {
      name: 'HSR Layout Sector 1-7',
      level: JurisdictionLevel.AREA,
      parentId: subDivision.id,
      cityId: city.id,
      isActive: true,
    },
  });
  console.log(`✅ Jurisdictions created: Division (${division.name}), SubDivision (${subDivision.name}), Area (${area.name})`);

  // 3. Seed Super Admin
  const hashedPassword = await argon2.hash('Admin@123456');
  const superAdmin = await prisma.admin.upsert({
    where: { email: 'superadmin@gearzo.in' },
    update: {},
    create: {
      email: 'superadmin@gearzo.in',
      phone: '+919999999999',
      name: 'GearZo Super Administrator',
      role: AdminRole.SUPER_ADMIN,
      jurisdictionId: division.id,
      passwordHash: hashedPassword,
      status: AdminStatus.ACTIVE,
      mustChangePassword: false,
      tokenVersion: 0,
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email} / Admin@123456`);

  // 4. Seed Vehicle Brands & Models
  const brandsData = [
    {
      name: 'Honda',
      types: [VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER],
      models: [
        { name: 'Activa 6G', type: VehicleType.TWO_WHEELER, fuelTypes: [FuelType.PETROL] },
        { name: 'City', type: VehicleType.FOUR_WHEELER, fuelTypes: [FuelType.PETROL, FuelType.DIESEL] },
      ],
    },
    {
      name: 'Maruti Suzuki',
      types: [VehicleType.FOUR_WHEELER],
      models: [
        { name: 'Swift', type: VehicleType.FOUR_WHEELER, fuelTypes: [FuelType.PETROL, FuelType.CNG] },
        { name: 'Brezza', type: VehicleType.FOUR_WHEELER, fuelTypes: [FuelType.PETROL] },
      ],
    },
    {
      name: 'Royal Enfield',
      types: [VehicleType.TWO_WHEELER],
      models: [
        { name: 'Classic 350', type: VehicleType.TWO_WHEELER, fuelTypes: [FuelType.PETROL] },
        { name: 'Hunter 350', type: VehicleType.TWO_WHEELER, fuelTypes: [FuelType.PETROL] },
      ],
    },
  ];

  for (const b of brandsData) {
    const brand = await prisma.vehicleBrand.create({
      data: {
        name: b.name,
        types: b.types,
        isActive: true,
      },
    });

    for (const m of b.models) {
      await prisma.vehicleModel.create({
        data: {
          brandId: brand.id,
          name: m.name,
          type: m.type,
          fuelTypes: m.fuelTypes,
          isActive: true,
        },
      });
    }
  }
  console.log(`✅ Seeded ${brandsData.length} Vehicle Brands with models`);

  // 5. Seed Service Categories & Services
  const periodicCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Periodic Maintenance',
      sortOrder: 1,
      isEmergency: false,
      isActive: true,
    },
  });

  const emergencyCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Roadside Assistance & Breakdown',
      sortOrder: 2,
      isEmergency: true,
      isActive: true,
    },
  });

  // Services
  const generalService = await prisma.services.create({
    data: {
      categoryId: periodicCategory.id,
      name: 'Comprehensive General Service',
      description: 'Complete multi-point vehicle inspection, engine oil check, brake cleaning, spark plug service, and exterior foam wash.',
      includes: ['Engine oil change', 'Oil filter replacement', 'Air filter cleaning', 'Brake pad inspection', 'Full exterior wash'],
      excludes: ['Major part replacements', 'Bodywork/denting'],
      durationMin: 90,
      priceType: PriceType.FIXED,
      vehicleTypes: [VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER],
      allowedModes: [ServiceMode.DOORSTEP, ServiceMode.PICKUP_DROP],
      isActive: true,
      sortOrder: 1,
    },
  });

  // Service Price for 2-wheeler: Rs 699 (69900 paise), 4-wheeler: Rs 2499 (249900 paise)
  await prisma.servicePrice.createMany({
    data: [
      {
        serviceId: generalService.id,
        vehicleType: VehicleType.TWO_WHEELER,
        pricePaise: 69900,
      },
      {
        serviceId: generalService.id,
        vehicleType: VehicleType.FOUR_WHEELER,
        pricePaise: 249900,
      },
    ],
  });

  const jumpstartService = await prisma.services.create({
    data: {
      categoryId: emergencyCategory.id,
      name: 'Battery Jumpstart',
      description: 'Quick on-demand battery boost at your current breakdown location within 30 minutes.',
      includes: ['Voltage test', 'Jumpstart with heavy-duty cables', 'Alternator charging health check'],
      excludes: ['New battery replacement cost'],
      durationMin: 30,
      priceType: PriceType.FIXED,
      vehicleTypes: [VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER],
      allowedModes: [ServiceMode.DOORSTEP],
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.servicePrice.createMany({
    data: [
      {
        serviceId: jumpstartService.id,
        vehicleType: VehicleType.TWO_WHEELER,
        pricePaise: 29900,
      },
      {
        serviceId: jumpstartService.id,
        vehicleType: VehicleType.FOUR_WHEELER,
        pricePaise: 49900,
      },
    ],
  });

  console.log('✅ Seeded Service Categories, Services & Base Pricing');
  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

