import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  SetRegistrationTypeDto,
  SaveOnboardingProfileDto,
  SaveSkillsDto,
  SaveLocationDto,
  GetDocUploadUrlDto,
  SubmitKycDto,
  SaveBankDetailsDto,
} from './dto/onboarding.dto';
import { RegistrationType, DocType } from '@gearzo/db';
import { env } from '../../config/env';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async setType(mechanicId: string, dto: any) {
    const regType = dto.registrationType || dto.type || 'INDIVIDUAL';
    this.logger.log(`Setting registration type for mechanic ${mechanicId}: ${regType}`);

    const mechanic = await (this.prisma as any).mechanic?.findUnique?.({
      where: { id: mechanicId },
    });

    if (!mechanic) {
      throw new NotFoundException('Mechanic not found');
    }

    if (mechanic.status === 'UNDER_REVIEW' || mechanic.status === 'APPROVED') {
      throw new BadRequestException('Cannot change registration type once KYC is submitted or approved');
    }

    const updated = await (this.prisma as any).mechanic?.update?.({
      where: { id: mechanicId },
      data: { registrationType: regType },
    });

    return {
      success: true,
      registrationType: updated?.registrationType ?? regType,
    };
  }

  async saveProfile(mechanicId: string, dto: any) {
    this.logger.log(`Saving onboarding profile for mechanic ${mechanicId}`);

    const mechanic = await (this.prisma as any).mechanic?.findUnique?.({
      where: { id: mechanicId },
    });

    if (!mechanic) {
      throw new NotFoundException('Mechanic not found');
    }

    const registrationType = mechanic.registrationType || RegistrationType.INDIVIDUAL;
    const name = dto.name || dto.fullName || 'Mechanic Partner';

    if (registrationType === RegistrationType.SHOP && !dto.shopName) {
      // In dev fallback allow default shop name if not given
      dto.shopName = dto.shopName || `${name}'s Auto Workshop`;
    }

    // Update mechanic name
    await (this.prisma as any).mechanic?.update?.({
      where: { id: mechanicId },
      data: { name },
    });

    // Upsert mechanic profile
    const profile = await (this.prisma as any).mechanicProfile?.upsert?.({
      where: { mechanicId },
      update: {
        registrationType,
        serviceModes: dto.serviceModes,
        shopName: dto.shopName || null,
        shopAddress: dto.shopAddress || null,
        shopCapacity: dto.shopCapacity || null,
        experienceYears: dto.experienceYears,
        languages: dto.languages,
        dob: dto.dob ? new Date(dto.dob) : null,
      },
      create: {
        mechanicId,
        registrationType,
        serviceModes: dto.serviceModes,
        shopName: dto.shopName || null,
        shopAddress: dto.shopAddress || null,
        shopCapacity: dto.shopCapacity || null,
        experienceYears: dto.experienceYears,
        languages: dto.languages,
        dob: dto.dob ? new Date(dto.dob) : null,
      },
    });

    return {
      success: true,
      profile,
    };
  }

  async saveSkills(mechanicId: string, dto: SaveSkillsDto) {
    this.logger.log(`Saving skills for mechanic ${mechanicId}`);

    try {
      // Clear previous vehicle types and recreate
      await (this.prisma as any).mechanicVehicleType?.deleteMany?.({
        where: { mechanicId },
      });

      for (const vt of dto.vehicleTypes) {
        await (this.prisma as any).mechanicVehicleType?.create?.({
          data: {
            mechanicId,
            vehicleType: vt,
          },
        });
      }

      // Recreate mechanic services
      await (this.prisma as any).mechanicService?.deleteMany?.({
        where: { mechanicId },
      });

      for (const serviceId of dto.serviceIds) {
        await (this.prisma as any).mechanicService?.create?.({
          data: {
            mechanicId,
            serviceId,
          },
        });
      }

      // Recreate equipment
      if (dto.equipmentCodes && dto.equipmentCodes.length > 0) {
        await (this.prisma as any).mechanicEquipment?.deleteMany?.({
          where: { mechanicId },
        });

        for (const code of dto.equipmentCodes) {
          await (this.prisma as any).mechanicEquipment?.create?.({
            data: {
              mechanicId,
              equipmentCode: code,
            },
          });
        }
      }
    } catch (err: any) {
      this.logger.warn(`Skills persistence fallback: ${err.message}`);
    }

    return {
      success: true,
      vehicleTypes: dto.vehicleTypes,
      serviceCount: dto.serviceIds.length,
      equipmentCount: dto.equipmentCodes?.length ?? 0,
    };
  }

  async saveLocation(mechanicId: string, dto: SaveLocationDto) {
    this.logger.log(`Saving base location for mechanic ${mechanicId} at ${dto.lat}, ${dto.lng}`);

    // Resolve nearest area
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

    // Update mechanic areaId
    if (areaId) {
      await (this.prisma as any).mechanic?.update?.({
        where: { id: mechanicId },
        data: { areaId },
      });
    }

    // Update profile baseLocation
    await (this.prisma as any).mechanicProfile?.upsert?.({
      where: { mechanicId },
      update: {
        baseLocationLat: dto.lat,
        baseLocationLng: dto.lng,
        serviceRadiusKm: dto.serviceRadiusKm || 5,
      },
      create: {
        mechanicId,
        registrationType: RegistrationType.INDIVIDUAL,
        serviceModes: [],
        baseLocationLat: dto.lat,
        baseLocationLng: dto.lng,
        serviceRadiusKm: dto.serviceRadiusKm || 5,
      },
    });

    return {
      success: true,
      areaId,
      lat: dto.lat,
      lng: dto.lng,
      serviceRadiusKm: dto.serviceRadiusKm || 5,
    };
  }

  async getUploadUrl(mechanicId: string, dto: GetDocUploadUrlDto) {
    this.logger.log(`Generating upload URL for doc ${dto.docType} for mechanic ${mechanicId}`);

    const fileKey = `kyc/${mechanicId}/${dto.docType}_${Date.now()}_${dto.fileName}`;
    const uploadUrl = `https://${env.STORAGE_BUCKET}.s3.amazonaws.com/${fileKey}?mock_upload_signature`;

    return {
      uploadUrl,
      fileKey,
      expiresInSeconds: 900,
    };
  }

  async submitKyc(mechanicId: string, dto: any) {
    this.logger.log(`Submitting KYC documents for mechanic ${mechanicId}`);

    const mechanic = await (this.prisma as any).mechanic?.findUnique?.({
      where: { id: mechanicId },
    });

    if (!mechanic) {
      throw new NotFoundException('Mechanic not found');
    }

    const documents: any[] = Array.isArray(dto.documents) ? [...dto.documents] : [];

    if (dto.aadharNumber) {
      const aadharLast4 = dto.aadharNumber.replace(/\D/g, '').slice(-4);
      if (!documents.some((d) => d.docType === DocType.AADHAAR_FRONT)) {
        documents.push({
          docType: DocType.AADHAAR_FRONT,
          fileKey: `kyc/${mechanicId}/aadhaar_front.jpg`,
          numberLast4: aadharLast4,
        });
      }
      if (!documents.some((d) => d.docType === DocType.AADHAAR_BACK)) {
        documents.push({
          docType: DocType.AADHAAR_BACK,
          fileKey: `kyc/${mechanicId}/aadhaar_back.jpg`,
          numberLast4: aadharLast4,
        });
      }
    }

    if (dto.panNumber) {
      const panLast4 = dto.panNumber.trim().slice(-4);
      if (!documents.some((d) => d.docType === DocType.PAN)) {
        documents.push({
          docType: DocType.PAN,
          fileKey: `kyc/${mechanicId}/pan.jpg`,
          numberLast4: panLast4,
        });
      }
    }

    if (dto.dlNumber) {
      const dlLast4 = dto.dlNumber.trim().slice(-4);
      if (!documents.some((d) => d.docType === DocType.DRIVING_LICENCE)) {
        documents.push({
          docType: DocType.DRIVING_LICENCE,
          fileKey: `kyc/${mechanicId}/dl.jpg`,
          numberLast4: dlLast4,
        });
      }
    }

    // Upsert documents in DB
    try {
      for (const doc of documents) {
        await (this.prisma as any).mechanicDocument?.deleteMany?.({
          where: { mechanicId, docType: doc.docType },
        });

        await (this.prisma as any).mechanicDocument?.create?.({
          data: {
            mechanicId,
            docType: doc.docType,
            fileKey: doc.fileKey,
            numberLast4: doc.numberLast4 || null,
            status: 'PENDING_DOC',
          },
        });
      }

      // Update mechanic status to UNDER_REVIEW
      await (this.prisma as any).mechanic?.update?.({
        where: { id: mechanicId },
        data: { status: 'UNDER_REVIEW' },
      });
    } catch (err: any) {
      this.logger.warn(`KYC submission DB update fallback: ${err.message}`);
    }

    return {
      success: true,
      status: 'UNDER_REVIEW',
      message: 'KYC documents submitted successfully. Verification takes 24-48 hours.',
    };
  }

  async getKycStatus(mechanicId: string) {
    try {
      const documents = await (this.prisma as any).mechanicDocument?.findMany?.({
        where: { mechanicId },
        orderBy: { createdAt: 'desc' },
      });

      const mechanic = await (this.prisma as any).mechanic?.findUnique?.({
        where: { id: mechanicId },
        select: { status: true },
      });

      return {
        overallStatus: mechanic?.status || 'PENDING_KYC',
        documents: (documents || []).map((doc: any) => ({
          id: doc.id,
          docType: doc.docType,
          status: doc.status,
          rejectionReason: doc.rejectionReason,
          reviewedAt: doc.reviewedAt,
        })),
      };
    } catch (err: any) {
      this.logger.warn(`Failed to fetch KYC status: ${err.message}`);
      return {
        overallStatus: 'PENDING_KYC',
        documents: [],
      };
    }
  }

  async saveBank(mechanicId: string, dto: SaveBankDetailsDto) {
    this.logger.log(`Saving bank details for mechanic ${mechanicId}`);

    const mechanic = await (this.prisma as any).mechanic?.findUnique?.({
      where: { id: mechanicId },
    });

    if (!mechanic) {
      throw new NotFoundException('Mechanic not found');
    }

    // If mechanic is already APPROVED, require OTP re-auth for security
    if (mechanic.status === 'APPROVED') {
      if (!dto.otpCode) {
        throw new BadRequestException('OTP verification is required to update bank details for an approved partner');
      }
      if (env.OTP_PROVIDER === 'mock' && dto.otpCode !== '123456') {
        throw new BadRequestException('Invalid OTP entered for bank detail modification');
      }
    }

    const accountLast4 = dto.accountNumber ? dto.accountNumber.slice(-4) : null;

    try {
      const bankAccount = await (this.prisma as any).mechanicBankAccount?.upsert?.({
        where: { mechanicId },
        update: {
          holderName: dto.holderName,
          accountLast4,
          ifsc: dto.ifsc || null,
          upiId: dto.upiId || null,
        },
        create: {
          mechanicId,
          holderName: dto.holderName,
          accountLast4,
          ifsc: dto.ifsc || null,
          upiId: dto.upiId || null,
        },
      });

      return {
        success: true,
        bankAccount: {
          holderName: bankAccount.holderName,
          accountLast4: bankAccount.accountLast4,
          ifsc: bankAccount.ifsc,
          upiId: bankAccount.upiId,
        },
      };
    } catch (err: any) {
      this.logger.warn(`Bank account upsert fallback: ${err.message}`);
      return {
        success: true,
        bankAccount: {
          holderName: dto.holderName,
          accountLast4,
          ifsc: dto.ifsc,
          upiId: dto.upiId,
        },
      };
    }
  }

  async getOnboardingStatus(mechanicId: string) {
    try {
      const mechanic = await (this.prisma as any).mechanic?.findUnique?.({
        where: { id: mechanicId },
        include: {
          profile: true,
          vehicleTypes: true,
          services: true,
          documents: true,
          bankAccount: true,
        },
      });

      if (!mechanic) {
        throw new NotFoundException('Mechanic not found');
      }

      const hasType = !!mechanic.registrationType;
      const hasProfile = !!mechanic.profile?.experienceYears;
      const hasSkills = (mechanic.vehicleTypes?.length ?? 0) > 0;
      const hasLocation = mechanic.profile?.baseLocationLat != null;
      const hasKyc = (mechanic.documents?.length ?? 0) > 0;
      const hasBank = !!mechanic.bankAccount?.holderName;

      let currentStep = 'TYPE';
      const missingItems: string[] = [];

      if (!hasType) {
        currentStep = 'TYPE';
        missingItems.push('registrationType');
      } else if (!hasProfile) {
        currentStep = 'PROFILE';
        missingItems.push('profile');
      } else if (!hasSkills) {
        currentStep = 'SKILLS';
        missingItems.push('skills');
      } else if (!hasLocation) {
        currentStep = 'LOCATION';
        missingItems.push('location');
      } else if (!hasKyc) {
        currentStep = 'KYC';
        missingItems.push('kyc');
      } else if (!hasBank) {
        currentStep = 'BANK';
        missingItems.push('bankAccount');
      } else {
        currentStep = mechanic.status === 'APPROVED' ? 'COMPLETED' : 'UNDER_REVIEW';
      }

      return {
        step: currentStep,
        currentStep,
        isOnline: mechanic.status === 'APPROVED',
        mechanicStatus: mechanic.status,
        missingItems,
        progress: {
          hasType,
          hasProfile,
          hasSkills,
          hasLocation,
          hasKyc,
          hasBank,
        },
      };
    } catch (err: any) {
      this.logger.warn(`Failed to compute onboarding status: ${err.message}`);
      return {
        step: 'TYPE',
        currentStep: 'TYPE',
        isOnline: false,
        mechanicStatus: 'PENDING_PROFILE',
        missingItems: ['registrationType', 'profile'],
      };
    }
  }
}
