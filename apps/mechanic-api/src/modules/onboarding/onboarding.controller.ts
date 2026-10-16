import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import {
  SetRegistrationTypeDto,
  SaveOnboardingProfileDto,
  SaveSkillsDto,
  SaveLocationDto,
  GetDocUploadUrlDto,
  SubmitKycDto,
  SaveBankDetailsDto,
} from './dto/onboarding.dto';
import { MechanicAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Onboarding')
@Controller(['', 'mechanic'])
@UseGuards(MechanicAuthGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Put('onboarding/type')
  async setTypePut(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.setType(mechanicId, dto);
  }

  @Post('onboarding/type')
  @ApiOperation({ summary: 'Select registration type (SHOP, INDIVIDUAL, DIRECT_JOB)' })
  async setType(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.setType(mechanicId, dto);
  }

  @Put('onboarding/profile')
  async saveProfilePut(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.saveProfile(mechanicId, dto);
  }

  @Post('onboarding/profile')
  @ApiOperation({ summary: 'Save mechanic and workshop details during onboarding' })
  async saveProfile(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.saveProfile(mechanicId, dto);
  }

  @Put('onboarding/skills')
  async saveSkillsPut(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.saveSkills(mechanicId, dto);
  }

  @Post('onboarding/skills')
  @ApiOperation({ summary: 'Save vehicle types, services offered, and equipment checklist' })
  async saveSkills(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.saveSkills(mechanicId, dto);
  }

  @Put('onboarding/location')
  async saveLocationPut(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.saveLocation(mechanicId, dto);
  }

  @Post('onboarding/location')
  @ApiOperation({ summary: 'Save operating base location and service radius' })
  async saveLocation(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.saveLocation(mechanicId, dto);
  }

  @Post('kyc/upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate presigned S3 upload URL for KYC document' })
  async getUploadUrl(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: GetDocUploadUrlDto,
  ) {
    return this.onboardingService.getUploadUrl(mechanicId, dto);
  }

  @Post(['kyc/submit', 'onboarding/kyc'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit KYC documents for admin review and background verification' })
  async submitKyc(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.submitKyc(mechanicId, dto);
  }

  @Get('kyc')
  @ApiOperation({ summary: 'Get current status of submitted KYC documents' })
  async getKycStatus(@CurrentUser('id') mechanicId: string) {
    return this.onboardingService.getKycStatus(mechanicId);
  }

  @Put('bank')
  async saveBankPut(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.saveBank(mechanicId, dto);
  }

  @Post(['bank', 'onboarding/bank'])
  @ApiOperation({ summary: 'Save payout bank details or UPI ID (Requires OTP if APPROVED)' })
  async saveBank(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: any,
  ) {
    return this.onboardingService.saveBank(mechanicId, dto);
  }

  @Get('onboarding/status')
  @ApiOperation({ summary: 'Check onboarding progression step and missing requirements' })
  async getOnboardingStatus(@CurrentUser('id') mechanicId: string) {
    return this.onboardingService.getOnboardingStatus(mechanicId);
  }
}
