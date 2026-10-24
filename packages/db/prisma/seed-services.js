const { PrismaClient, PriceType, VehicleType, ServiceMode } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding comprehensive services into PostgreSQL...');

  // Ensure categories exist
  let periodicCategory = await prisma.serviceCategory.findFirst({
    where: { name: 'Periodic Maintenance' },
  });
  if (!periodicCategory) {
    periodicCategory = await prisma.serviceCategory.create({
      data: {
        name: 'Periodic Maintenance',
        sortOrder: 1,
        isEmergency: false,
        isActive: true,
      },
    });
  }

  let emergencyCategory = await prisma.serviceCategory.findFirst({
    where: { name: 'Roadside Assistance & Breakdown' },
  });
  if (!emergencyCategory) {
    emergencyCategory = await prisma.serviceCategory.create({
      data: {
        name: 'Roadside Assistance & Breakdown',
        sortOrder: 2,
        isEmergency: true,
        isActive: true,
      },
    });
  }

  let repairsCategory = await prisma.serviceCategory.findFirst({
    where: { name: 'Repairs & Quick Fixes' },
  });
  if (!repairsCategory) {
    repairsCategory = await prisma.serviceCategory.create({
      data: {
        name: 'Repairs & Quick Fixes',
        sortOrder: 3,
        isEmergency: false,
        isActive: true,
      },
    });
  }

  const servicesData = [
    {
      categoryId: emergencyCategory.id,
      name: 'Doorstep Bike Puncture Repair',
      description: 'Immediate on-demand puncture repair for tubeless and tube motorcycles & scooters at doorstep or roadside.',
      includes: ['Tyre inspection & nail/debris removal', 'Up to 2 tubeless puncture strip fixes', 'Air pressure refill to OEM PSI', 'Test leak check'],
      excludes: ['New tube cost if tube is torn beyond repair', 'Tyre replacement'],
      durationMin: 25,
      priceType: PriceType.FIXED,
      vehicleTypes: [VehicleType.TWO_WHEELER],
      allowedModes: [ServiceMode.DOORSTEP],
      sortOrder: 1,
      prices: [{ vehicleType: VehicleType.TWO_WHEELER, pricePaise: 19900 }],
    },
    {
      categoryId: emergencyCategory.id,
      name: 'Car Flat Tyre & Puncture Repair',
      description: 'On-spot tubeless puncture strip repair or emergency spare wheel (stepney) installation for cars.',
      includes: ['Hydraulic jack lifting', 'Wheel removal & puncture plug insertion', 'Stepney spare wheel replacement if requested', 'Air pressure check all 4 tyres'],
      excludes: ['Major sidewall burst repair', 'New tyre replacement'],
      durationMin: 35,
      priceType: PriceType.FIXED,
      vehicleTypes: [VehicleType.FOUR_WHEELER],
      allowedModes: [ServiceMode.DOORSTEP],
      sortOrder: 2,
      prices: [{ vehicleType: VehicleType.FOUR_WHEELER, pricePaise: 34900 }],
    },
    {
      categoryId: emergencyCategory.id,
      name: 'Emergency Fuel Delivery',
      description: 'Immediate doorstep delivery of up to 5 Litres petrol or diesel when stranded with an empty tank.',
      includes: ['Safe canister fuel delivery', 'Tank filling assistance', 'Engine priming / cranking assistance'],
      excludes: ['Fuel cost (billed at local pump retail price)'],
      durationMin: 30,
      priceType: PriceType.FIXED,
      vehicleTypes: [VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER],
      allowedModes: [ServiceMode.DOORSTEP],
      sortOrder: 3,
      prices: [
        { vehicleType: VehicleType.TWO_WHEELER, pricePaise: 19900 },
        { vehicleType: VehicleType.FOUR_WHEELER, pricePaise: 29900 },
      ],
    },
    {
      categoryId: emergencyCategory.id,
      name: 'Flatbed Vehicle Towing',
      description: 'Safe hydraulic flatbed or wheel-lift towing to your nearest authorized garage or destination.',
      includes: ['Certified heavy tow-truck dispatch', 'Secure vehicle winch loading & wheel strapping', 'First 10 km towing included'],
      excludes: ['Additional distance beyond 10 km (₹40/km)'],
      durationMin: 60,
      priceType: PriceType.FIXED,
      vehicleTypes: [VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER],
      allowedModes: [ServiceMode.PICKUP_DROP],
      sortOrder: 4,
      prices: [
        { vehicleType: VehicleType.TWO_WHEELER, pricePaise: 69900 },
        { vehicleType: VehicleType.FOUR_WHEELER, pricePaise: 129900 },
      ],
    },
    {
      categoryId: repairsCategory.id,
      name: 'Chain Lubrication & Tensioning',
      description: 'High-pressure chain degreasing, sprocket inspection, tension adjustment, and high-performance synthetic lube.',
      includes: ['Chain degreasing with cleaner spray', 'Sprocket teeth wear inspection', 'Slack adjustment to factory specs', 'High-tack synthetic lube application'],
      excludes: ['New chain kit replacement parts'],
      durationMin: 30,
      priceType: PriceType.FIXED,
      vehicleTypes: [VehicleType.TWO_WHEELER],
      allowedModes: [ServiceMode.DOORSTEP],
      sortOrder: 1,
      prices: [{ vehicleType: VehicleType.TWO_WHEELER, pricePaise: 19900 }],
    },
    {
      categoryId: repairsCategory.id,
      name: 'Brake Overhaul & Pad Replacement',
      description: 'Brake pad and shoe inspection, rotor cleaning, disc deglazing, and fluid level check for confident stopping.',
      includes: ['Front & rear brake inspection', 'Caliper cleaning & slider pin greasing', 'Brake free-play and cable adjustment', 'Test ride verification'],
      excludes: ['Cost of new brake pads/rotors'],
      durationMin: 45,
      priceType: PriceType.FIXED,
      vehicleTypes: [VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER],
      allowedModes: [ServiceMode.DOORSTEP, ServiceMode.PICKUP_DROP],
      sortOrder: 2,
      prices: [
        { vehicleType: VehicleType.TWO_WHEELER, pricePaise: 29900 },
        { vehicleType: VehicleType.FOUR_WHEELER, pricePaise: 69900 },
      ],
    },
    {
      categoryId: periodicCategory.id,
      name: 'Check My Vehicle (Inspection & Report)',
      description: '24-point physical condition inspection, digital health report, and maintenance recommendations.',
      includes: ['Engine compression & oil quality test', 'Battery voltage & charging check', 'Tyre tread depth & brake pad wear assessment', 'Digital health score report'],
      excludes: ['Parts replacement labour'],
      durationMin: 45,
      priceType: PriceType.FIXED,
      vehicleTypes: [VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER],
      allowedModes: [ServiceMode.DOORSTEP],
      sortOrder: 3,
      prices: [
        { vehicleType: VehicleType.TWO_WHEELER, pricePaise: 29900 },
        { vehicleType: VehicleType.FOUR_WHEELER, pricePaise: 49900 },
      ],
    },
  ];

  for (const s of servicesData) {
    const existing = await prisma.services.findFirst({
      where: { name: s.name },
    });

    let serviceRecord;
    if (existing) {
      serviceRecord = await prisma.services.update({
        where: { id: existing.id },
        data: {
          categoryId: s.categoryId,
          description: s.description,
          includes: s.includes,
          excludes: s.excludes,
          durationMin: s.durationMin,
          priceType: s.priceType,
          vehicleTypes: s.vehicleTypes,
          allowedModes: s.allowedModes,
          sortOrder: s.sortOrder,
          isActive: true,
        },
      });
      console.log(`Updated service: ${s.name}`);
    } else {
      serviceRecord = await prisma.services.create({
        data: {
          categoryId: s.categoryId,
          name: s.name,
          description: s.description,
          includes: s.includes,
          excludes: s.excludes,
          durationMin: s.durationMin,
          priceType: s.priceType,
          vehicleTypes: s.vehicleTypes,
          allowedModes: s.allowedModes,
          sortOrder: s.sortOrder,
          isActive: true,
        },
      });
      console.log(`Created service: ${s.name}`);
    }

    // Set prices
    for (const p of s.prices) {
      const existingPrice = await prisma.servicePrice.findFirst({
        where: {
          serviceId: serviceRecord.id,
          vehicleType: p.vehicleType,
          modelId: null,
          areaId: null,
        },
      });

      if (existingPrice) {
        await prisma.servicePrice.update({
          where: { id: existingPrice.id },
          data: { pricePaise: p.pricePaise },
        });
      } else {
        await prisma.servicePrice.create({
          data: {
            serviceId: serviceRecord.id,
            vehicleType: p.vehicleType,
            pricePaise: p.pricePaise,
          },
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
