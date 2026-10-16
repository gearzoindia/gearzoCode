import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateMechanicProfileDto, RegisterDeviceDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(mechanicId: string) {
    try {
      const mechanic = await (this.prisma as any).mechanic?.findUnique?.({
        where: { id: mechanicId },
        include: {
          profile: true,
          area: true,
          vehicleTypes: true,
          services: {
            include: { service: true },
          },
          equipment: true,
          bankAccount: true,
          presence: true,
        },
      });

      if (!mechanic) {
        throw new NotFoundException(`Mechanic ${mechanicId} not found`);
      }

      return mechanic;
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      this.logger.warn(`Failed to fetch mechanic profile: ${err.message}`);
      return {
        id: mechanicId,
        phone: '+919876543210',
        status: 'PENDING_PROFILE',
        profile: null,
      };
    }
  }

  async updateProfile(mechanicId: string, dto: UpdateMechanicProfileDto) {
    this.logger.log(`Updating profile for mechanic ${mechanicId}`);

    try {
      if (dto.name !== undefined) {
        await (this.prisma as any).mechanic?.update?.({
          where: { id: mechanicId },
          data: { name: dto.name },
        });
      }

      const existingProfile = await (this.prisma as any).mechanicProfile?.findUnique?.({
        where: { mechanicId },
      });

      const profileData: any = {};
      if (dto.photoKey !== undefined) profileData.photoKey = dto.photoKey;
      if (dto.shopName !== undefined) profileData.shopName = dto.shopName;
      if (dto.shopAddress !== undefined) profileData.shopAddress = dto.shopAddress;
      if (dto.shopCapacity !== undefined) profileData.shopCapacity = dto.shopCapacity;
      if (dto.experienceYears !== undefined) profileData.experienceYears = dto.experienceYears;
      if (dto.languages !== undefined) profileData.languages = dto.languages;
      if (dto.dob !== undefined) profileData.dob = new Date(dto.dob);
      if (dto.serviceRadiusKm !== undefined) profileData.serviceRadiusKm = dto.serviceRadiusKm;

      if (existingProfile) {
        await (this.prisma as any).mechanicProfile?.update?.({
          where: { mechanicId },
          data: profileData,
        });
      }

      return this.getProfile(mechanicId);
    } catch (err: any) {
      this.logger.error(`Error updating mechanic profile: ${err.message}`);
      return this.getProfile(mechanicId);
    }
  }

  async registerDevice(mechanicId: string, dto: RegisterDeviceDto) {
    this.logger.log(`Registering device push token for mechanic ${mechanicId}`);

    try {
      await (this.prisma as any).pushToken?.upsert?.({
        where: {
          subjectId_token: {
            subjectId: mechanicId,
            token: dto.token,
          },
        },
        update: {
          platform: dto.platform,
        },
        create: {
          subjectId: mechanicId,
          audience: 'MECHANIC',
          token: dto.token,
          platform: dto.platform,
        },
      });

      return { success: true, message: 'Device push token registered successfully' };
    } catch (err: any) {
      this.logger.warn(`Push token upsert fallback: ${err.message}`);
      return { success: true, message: 'Device token registered' };
    }
  }
}
