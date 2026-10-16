import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SearchServiceDto } from './dto/search-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getServiceCategories() {
    return [
      { id: 'cat_periodic', name: 'Periodic Service', iconUrl: '/icons/periodic.png', description: 'Scheduled maintenance and health check' },
      { id: 'cat_repairs', name: 'Repairs & Fitment', iconUrl: '/icons/repairs.png', description: 'Brakes, engine, electrical fixes' },
      { id: 'cat_detailing', name: 'Wash & Detailing', iconUrl: '/icons/wash.png', description: 'Foam wash, deep cleaning & polishing' },
      { id: 'cat_tyres', name: 'Tyres & Wheels', iconUrl: '/icons/tyres.png', description: 'Puncture, tyre change, wheel alignment' },
      { id: 'cat_emergency', name: 'SOS Emergency Roadside', iconUrl: '/icons/sos.png', description: 'Immediate jump-start, towing, fuel' },
    ];
  }

  async listServices(categoryId?: string, vehicleTypeId?: string, areaId?: string) {
    return [
      {
        id: 'srv_general_service_2w',
        categoryId: categoryId || 'cat_periodic',
        name: 'Comprehensive General Service',
        description: 'Complete 25-point inspection, engine oil change, spark plug check, brake overhaul',
        durationMinutes: 90,
        pricePaise: 99900, // Rs 999
        originalPricePaise: 149900,
        isPopular: true,
        packageItems: [
          'Engine oil replacement',
          'Air filter cleaning/replacement',
          'Brake pad cleaning & adjustment',
          'Chain lubrication and tension check',
          'Water wash & polish',
        ],
      },
      {
        id: 'srv_oil_change',
        categoryId: categoryId || 'cat_periodic',
        name: 'Engine Oil Replacement',
        description: 'Premium synthetic oil change with filter inspection',
        durationMinutes: 45,
        pricePaise: 49900,
        originalPricePaise: 69900,
        isPopular: false,
        packageItems: ['Oil drain & refill', 'Level sensor check', 'Disposal of old oil'],
      },
    ];
  }

  async getServiceById(id: string, vehicleTypeId?: string, areaId?: string) {
    return {
      id,
      name: 'Comprehensive General Service',
      description: 'Complete 25-point inspection, engine oil change, spark plug check, brake overhaul',
      durationMinutes: 90,
      pricePaise: 99900,
      originalPricePaise: 149900,
      packageItems: [
        'Engine oil replacement',
        'Air filter cleaning/replacement',
        'Brake pad cleaning & adjustment',
        'Chain lubrication and tension check',
        'Water wash & polish',
      ],
      warrantyDays: 30,
      termsAndConditions: 'Warranty applies to workmanship and GearZo genuine spares.',
    };
  }

  async searchServices(dto: SearchServiceDto) {
    const services = await this.listServices(dto.categoryId, dto.vehicleTypeId, dto.areaId);
    if (!dto.query) return services;
    const q = dto.query.toLowerCase();
    return services.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
    );
  }
}
