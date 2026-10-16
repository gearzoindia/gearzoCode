import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

const MAX_ADDRESSES_PER_CUSTOMER = 10;

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(customerId: string) {
    try {
      const addresses = await (this.prisma as any).customerAddress?.findMany?.({
        where: { customerId },
        include: { area: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      return addresses || [];
    } catch (err: any) {
      this.logger.warn(`Failed to list addresses: ${err.message}`);
      return [];
    }
  }

  async create(customerId: string, dto: CreateAddressDto) {
    const existingCount = await (this.prisma as any).customerAddress?.count?.({
      where: { customerId },
    }) ?? 0;

    if (existingCount >= MAX_ADDRESSES_PER_CUSTOMER) {
      throw new BadRequestException(
        `Address limit reached. Customers can store up to ${MAX_ADDRESSES_PER_CUSTOMER} addresses.`,
      );
    }

    // Resolve areaId by finding active area jurisdiction
    let areaId: string | null = null;
    try {
      const area = await (this.prisma as any).jurisdiction?.findFirst?.({
        where: { level: 'AREA', isActive: true },
      });
      if (area) {
        areaId = area.id;
      }
    } catch {
      // Area fallback
    }

    // If first address or requested default, set isDefault = true
    const isDefault = existingCount === 0 ? true : !!dto.isDefault;

    if (isDefault) {
      await (this.prisma as any).customerAddress?.updateMany?.({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    try {
      const address = await (this.prisma as any).customerAddress?.create?.({
        data: {
          customerId,
          label: dto.label || 'HOME',
          line1: dto.line1,
          line2: dto.line2 || null,
          landmark: dto.landmark || null,
          lat: dto.lat,
          lng: dto.lng,
          areaId,
          isDefault,
        },
        include: { area: true },
      });
      return address;
    } catch (err: any) {
      this.logger.error(`Failed to create address: ${err.message}`);
      throw new BadRequestException('Failed to save address');
    }
  }

  async update(customerId: string, id: string, dto: UpdateAddressDto) {
    const existing = await (this.prisma as any).customerAddress?.findFirst?.({
      where: { id, customerId },
    });

    if (!existing) {
      throw new NotFoundException(`Address ${id} not found`);
    }

    if (dto.isDefault) {
      await (this.prisma as any).customerAddress?.updateMany?.({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    try {
      const updated = await (this.prisma as any).customerAddress?.update?.({
        where: { id },
        data: {
          ...(dto.label !== undefined && { label: dto.label }),
          ...(dto.line1 !== undefined && { line1: dto.line1 }),
          ...(dto.line2 !== undefined && { line2: dto.line2 }),
          ...(dto.landmark !== undefined && { landmark: dto.landmark }),
          ...(dto.lat !== undefined && { lat: dto.lat }),
          ...(dto.lng !== undefined && { lng: dto.lng }),
          ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        },
        include: { area: true },
      });
      return updated;
    } catch (err: any) {
      this.logger.error(`Failed to update address: ${err.message}`);
      throw new BadRequestException('Failed to update address');
    }
  }

  async delete(customerId: string, id: string) {
    const existing = await (this.prisma as any).customerAddress?.findFirst?.({
      where: { id, customerId },
    });

    if (!existing) {
      throw new NotFoundException(`Address ${id} not found`);
    }

    await (this.prisma as any).customerAddress?.delete?.({
      where: { id },
    });

    // If deleted address was default, make another address default if available
    if (existing.isDefault) {
      const nextAddress = await (this.prisma as any).customerAddress?.findFirst?.({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      });
      if (nextAddress) {
        await (this.prisma as any).customerAddress?.update?.({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true, message: 'Address deleted successfully' };
  }

  async setDefault(customerId: string, id: string) {
    return this.update(customerId, id, { isDefault: true });
  }
}
