import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SearchServiceDto } from './dto/search-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getServiceCategories() {
    return [
      { id: 'cat_book_mechanic', name: 'Book a Mechanic', iconUrl: '/icons/mechanic.png', description: 'Instant doorstep diagnostic & repair' },
      { id: 'cat_periodic', name: 'Service Packages', iconUrl: '/icons/periodic.png', description: 'General & comprehensive service bundles' },
      { id: 'cat_repairs', name: 'Specific Repair', iconUrl: '/icons/repairs.png', description: 'Targeted repairs and component replacements' },
      { id: 'cat_detailing', name: 'Wash & Detailing', iconUrl: '/icons/wash.png', description: 'Foam wash, deep cleaning & polishing' },
      { id: 'cat_tyres', name: 'Shop Spares', iconUrl: '/icons/tyres.png', description: 'Genuine parts, batteries & lubricants' },
    ];
  }

  private readonly catalogue = [
    // Two-Wheeler: Book a Mechanic
    {
      id: 'srv_book_mechanic_2w',
      categoryId: 'cat_book_mechanic',
      subCategory: 'Book a Mechanic',
      vehicleType: 'TWO_WHEELER',
      name: 'Book A Mechanic',
      description: 'Doorstep technician visit, 18-point inspection & minor tuning',
      durationMinutes: 30,
      pricePaise: 29900,
      originalPricePaise: 49900,
      warranty: '7 Day Guarantee',
      warrantyDays: 7,
      badge: null,
      isPopular: true,
      requiresProduct: false,
      packageItems: [
        'Doorstep technician arrival in 30-45 mins',
        '18-point comprehensive safety inspection',
        'Brake free-play & cable adjustment',
        'Chain lubrication & slack inspection',
        'Battery terminal & spark plug clean',
        'Minor tune-up & test ride',
      ],
      excludes: ['Replacement spare parts cost', 'Major engine overhaul'],
      termsAndConditions: '₹299 covers inspection and minor labour. Additional parts or major repairs quoted after inspection.',
    },
    {
      id: 'srv_check_vehicle_2w',
      categoryId: 'cat_book_mechanic',
      subCategory: 'Book a Mechanic',
      vehicleType: 'TWO_WHEELER',
      name: 'Check My Vehicle',
      description: 'Comprehensive 24-point physical inspection and diagnostic health report',
      durationMinutes: 60,
      pricePaise: 29900,
      originalPricePaise: 49900,
      warranty: 'Digital Health Report',
      warrantyDays: 7,
      badge: null,
      isPopular: false,
      requiresProduct: false,
      packageItems: [
        '24-point mechanical & electrical inspection',
        'Engine health & compression assessment',
        'Brake pads & disc wear check',
        'Tyre tread & alignment check',
        'Digital diagnostic condition report',
      ],
      excludes: ['Labour for repairs', 'Spare parts'],
      termsAndConditions: 'Includes comprehensive inspection report delivered to app.',
    },
    {
      id: 'srv_consultation_2w',
      categoryId: 'cat_book_mechanic',
      subCategory: 'Book a Mechanic',
      vehicleType: 'TWO_WHEELER',
      name: 'Mechanic Consultation (Via Call)',
      description: 'Live 1-on-1 audio/video call with certified senior master technician',
      durationMinutes: 15,
      pricePaise: 9900,
      originalPricePaise: 19900,
      warranty: 'Instant Advice',
      warrantyDays: 1,
      badge: null,
      isPopular: false,
      requiresProduct: false,
      packageItems: [
        'Direct 15-minute phone consultation with expert mechanic',
        'Sound & symptom diagnosis review',
        'Second opinion on garage estimates',
        'Preventative maintenance recommendations',
      ],
      excludes: ['Physical visit', 'Hands-on repairs'],
      termsAndConditions: 'Consultation conducted over phone call.',
    },

    // Two-Wheeler: Service Packages
    {
      id: 'srv_general_service_2w',
      categoryId: 'cat_periodic',
      subCategory: 'Service Packages',
      vehicleType: 'TWO_WHEELER',
      name: 'General Service',
      description: 'Full 30-point periodic service, filter cleaning, brake servicing and wash',
      durationMinutes: 120,
      pricePaise: 34900,
      originalPricePaise: 59900,
      warranty: '10 Day Warranty',
      warrantyDays: 10,
      badge: 'Offer',
      isPopular: true,
      requiresProduct: false,
      packageItems: [
        'Full 30-point general service',
        'Air filter & spark plug cleaning',
        'Brake overhaul & cleaning (front & rear)',
        'Chain clean, lubrication & adjustment',
        'Clutch & accelerator cable lubrication',
        'Exterior wash and polish',
      ],
      excludes: ['Engine oil cost (unless provided by customer)', 'Spare parts replacement'],
      termsAndConditions: 'Covers service labour and general consumables.',
    },
    {
      id: 'srv_general_oil_2w',
      categoryId: 'cat_periodic',
      subCategory: 'Service Packages',
      vehicleType: 'TWO_WHEELER',
      name: 'General Service (With Engine Oil)',
      description: 'Premium general service including brand-approved 4T synthetic engine oil',
      durationMinutes: 120,
      pricePaise: 69900,
      originalPricePaise: 99900,
      warranty: '10 Day Warranty',
      warrantyDays: 10,
      badge: 'Recommended',
      isPopular: true,
      requiresProduct: false,
      packageItems: [
        'Premium 4T engine oil replacement included (up to 1.2L)',
        'Oil filter replacement / cleaning',
        'Full 30-point periodic service',
        'Spark plug clean & gap adjustment',
        'Front & rear brake pad adjustment & wash',
        'Chain degreasing & high-performance lube',
      ],
      excludes: ['Additional mechanical repairs outside checklist'],
      termsAndConditions: 'Includes genuine grade 4T synthetic blend oil.',
    },
    {
      id: 'srv_comprehensive_2w',
      categoryId: 'cat_periodic',
      subCategory: 'Service Packages',
      vehicleType: 'TWO_WHEELER',
      name: 'Comprehensive Service (Engine Oil & Air Filter Incl…)',
      description: 'Master service including engine oil, air filter, spark plug and carburettor tune',
      durationMinutes: 180,
      pricePaise: 89900,
      originalPricePaise: 139900,
      warranty: '15 Day Warranty',
      warrantyDays: 15,
      badge: 'Trending',
      isPopular: true,
      requiresProduct: false,
      packageItems: [
        'OEM-grade engine oil included',
        'Brand new air filter replacement included',
        'Spark plug replacement / deep clean',
        'Carburettor / Throttle body cleaning',
        'Complete brake shoe inspection & servicing',
        'Wheel bearing lubrication & suspension check',
      ],
      excludes: ['Tyre replacements'],
      termsAndConditions: 'All essential routine consumables included.',
    },

    // Two-Wheeler: Specific Repair
    {
      id: 'srv_chain_lube_2w',
      categoryId: 'cat_repairs',
      subCategory: 'Specific Repair',
      vehicleType: 'TWO_WHEELER',
      name: 'Chain Lubrication',
      description: 'High-pressure chain degreasing, roller cleaning, tension slack setting and synthetic lube',
      durationMinutes: 30,
      pricePaise: 19900,
      originalPricePaise: 29900,
      warranty: '7 Day Warranty',
      warrantyDays: 7,
      badge: null,
      isPopular: false,
      requiresProduct: false,
      packageItems: [
        'Drive chain degreasing with cleaner spray',
        'Sprocket teeth wear inspection',
        'Slack adjustment to factory specs',
        'High-tack synthetic chain lubricant coating',
      ],
      excludes: ['Chain link replacement', 'Sprocket kit replacement'],
      termsAndConditions: 'High-performance synthetic chain lube included.',
    },
    {
      id: 'srv_headlight_bulb_2w',
      categoryId: 'cat_repairs',
      subCategory: 'Specific Repair',
      vehicleType: 'TWO_WHEELER',
      name: 'Headlight Bulb Replacement',
      description: 'Headlight assembly removal, electrical connector testing and bulb fitment',
      durationMinutes: 30,
      pricePaise: 4900,
      originalPricePaise: 9900,
      warranty: '7 Day Warranty',
      warrantyDays: 7,
      badge: null,
      isPopular: false,
      requiresProduct: false,
      packageItems: [
        'Headlight mask disassembly & inspection',
        'Bulb socket voltage & ground testing',
        'New bulb installation & beam alignment',
        'High/low beam test ride check',
      ],
      excludes: ['Bulb hardware cost (unless selected in add-ons)'],
      termsAndConditions: 'Labour only. Spares billed separately or customer-supplied.',
    },
    {
      id: 'srv_battery_replace_2w',
      categoryId: 'cat_repairs',
      subCategory: 'Specific Repair',
      vehicleType: 'TWO_WHEELER',
      name: 'Battery Replacement',
      description: 'Old battery disposal, terminal cleaning, voltage check and battery installation',
      durationMinutes: 30,
      pricePaise: 19900,
      originalPricePaise: 29900,
      warranty: '4 Year Warranty on Battery',
      warrantyDays: 30,
      badge: null,
      isPopular: true,
      requiresProduct: true,
      packageItems: [
        'Battery compartment cleanup & terminal anti-rust spray',
        'Charging system & alternator output test',
        'Secure clamp mounting & connection',
        'Safe eco-friendly disposal / trade-in of old battery',
      ],
      excludes: ['Battery unit cost (mandatory add-on or customer provided)'],
      termsAndConditions: 'Requires battery product addition or customer-owned battery.',
    },

    // Four-Wheeler: Packages
    {
      id: 'srv_book_mechanic_4w',
      categoryId: 'cat_book_mechanic',
      subCategory: 'Book a Mechanic',
      vehicleType: 'FOUR_WHEELER',
      name: 'Book A Mechanic Consultant',
      description: 'Doorstep car inspection by master car technician with OBD-II diagnostic scanner',
      durationMinutes: 45,
      pricePaise: 29900,
      originalPricePaise: 59900,
      warranty: '7 Day Guarantee',
      warrantyDays: 7,
      badge: null,
      isPopular: true,
      requiresProduct: false,
      packageItems: [
        'Doorstep car diagnostic inspection',
        'OBD-II scanner error code readout',
        'Engine bay visual inspection',
        'Brake & suspension physical check',
        'Transparent estimate for required repairs',
      ],
      excludes: ['Cost of replacement parts'],
      termsAndConditions: 'Inspection charge credited if major repair is booked.',
    },
    {
      id: 'srv_basic_service_4w',
      categoryId: 'cat_periodic',
      subCategory: 'Service Packages',
      vehicleType: 'FOUR_WHEELER',
      name: 'Basic Periodic Service',
      description: '50-point safety check, coolant & fluid top-ups, wiper wash and brake check',
      durationMinutes: 180,
      pricePaise: 249900,
      originalPricePaise: 349900,
      warranty: '30 Day Warranty',
      warrantyDays: 30,
      badge: 'Offer',
      isPopular: true,
      requiresProduct: false,
      packageItems: [
        '50-point car health inspection',
        'Engine oil level and health check',
        'Coolant and brake fluid top-up',
        'Air filter clean and throttle body check',
        'Brake pad inspection and disc cleaning',
        'Battery health test and terminal service',
      ],
      excludes: ['Full synthetic engine oil replacement', 'AC gas top-up'],
      termsAndConditions: 'Valid for standard hatchbacks and compact sedans.',
    },
    {
      id: 'srv_standard_service_4w',
      categoryId: 'cat_periodic',
      subCategory: 'Service Packages',
      vehicleType: 'FOUR_WHEELER',
      name: 'Standard Periodic Service',
      description: 'Complete engine oil flush, OEM filter replacements, 60-point check & wheel inspection',
      durationMinutes: 240,
      pricePaise: 349900,
      originalPricePaise: 499900,
      warranty: '45 Day Warranty',
      warrantyDays: 45,
      badge: 'Recommended',
      isPopular: true,
      requiresProduct: false,
      packageItems: [
        'Synthetic blend engine oil change (up to 3.5L)',
        'New oil filter replacement',
        'Air filter clean or replacement',
        'All 4 wheels brake overhaul',
        'Coolant & windshield fluid top-up',
        'Spark plug & electrical check',
      ],
      excludes: ['Suspension parts'],
      termsAndConditions: 'Applicable to petrol and diesel passenger cars.',
    },
    {
      id: 'srv_comprehensive_4w',
      categoryId: 'cat_periodic',
      subCategory: 'Service Packages',
      vehicleType: 'FOUR_WHEELER',
      name: 'Comprehensive Car Service',
      description: 'Master full car maintenance with fully synthetic oil, AC service, OBD scan & foam wash',
      durationMinutes: 300,
      pricePaise: 499900,
      originalPricePaise: 699900,
      warranty: '60 Day Warranty',
      warrantyDays: 60,
      badge: 'Trending',
      isPopular: true,
      requiresProduct: false,
      packageItems: [
        'Fully synthetic engine oil replacement',
        'New oil filter and new air filter',
        'Full OBD-II diagnostic scan report',
        'AC filter cleaning & vent sanitisation',
        'Brake pad cleaning & disc deglazing',
        'Full exterior foam wash & interior vacuum',
      ],
      excludes: ['Major mechanical overhaul'],
      termsAndConditions: 'Complete bumper-to-bumper maintenance.',
    },
  ];

  // Related products / add-ons catalogue
  readonly products = [
    {
      id: 'prod_brake_fluid',
      name: 'Brake Fluid DOT 4',
      specification: '250ml Bosch DOT 4 Synthetic',
      pricePaise: 10000,
      originalPricePaise: 20000,
      discountText: '50% OFF',
      category: 'Fluids',
      compatibleVehicleTypes: ['TWO_WHEELER', 'FOUR_WHEELER'],
    },
    {
      id: 'prod_engine_oil',
      name: 'Engine Oil 4T 20W-40',
      specification: '1 Litre Castrol Activ 4T Premium',
      pricePaise: 78500,
      originalPricePaise: 85000,
      discountText: null,
      category: 'Oil',
      compatibleVehicleTypes: ['TWO_WHEELER'],
    },
    {
      id: 'prod_battery_2w',
      name: 'Bike Battery 2 Wheeler (8Ah)',
      specification: 'Exide Xplore 12V 8Ah Zero Maintenance',
      pricePaise: 239100,
      originalPricePaise: 280000,
      discountText: '48M Warranty',
      category: 'Battery',
      compatibleVehicleTypes: ['TWO_WHEELER'],
    },
  ];

  async listServices(categoryId?: string, vehicleTypeId?: string, areaId?: string) {
    let items = this.catalogue;

    if (vehicleTypeId) {
      const vType = vehicleTypeId.toUpperCase();
      items = items.filter((s) => s.vehicleType === vType);
    }

    if (categoryId && categoryId !== 'all') {
      items = items.filter((s) => s.categoryId === categoryId || s.subCategory === categoryId);
    }

    return items;
  }

  async getServiceById(id: string, vehicleTypeId?: string, areaId?: string) {
    const item = this.catalogue.find((s) => s.id === id);
    if (item) return item;

    // Fallback if id not found
    return {
      ...this.catalogue[0],
      id,
    };
  }

  async getProducts(vehicleTypeId?: string) {
    if (!vehicleTypeId) return this.products;
    const vType = vehicleTypeId.toUpperCase();
    return this.products.filter((p) => p.compatibleVehicleTypes.includes(vType));
  }

  async searchServices(dto: SearchServiceDto) {
    const services = await this.listServices(dto.categoryId, dto.vehicleTypeId, dto.areaId);
    if (!dto.query) return services;
    const q = dto.query.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.subCategory.toLowerCase().includes(q),
    );
  }
}
