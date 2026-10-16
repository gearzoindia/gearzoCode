
import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, RegisterDeviceDto, UploadAvatarDto } from './dto/profile.dto';
import { CustomerAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Profile')
@Controller(['me', 'customer', 'customer/profile'])
@UseGuards(CustomerAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current customer profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update customer profile' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }

  @Post(['', 'profile'])
  @ApiOperation({ summary: 'Save full customer profile during onboarding' })
  async saveProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.profileService.updateProfile(userId, dto);
    return {
      user: {
        id: updated.id || userId,
        phone: updated.phone || null,
        name: updated.name || dto.name || null,
        email: updated.email || dto.email || null,
        role: 'customer',
        isProfileComplete: updated.isProfileComplete ?? true,
      },
    };
  }

  @Post('profile/skip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Skip optional profile details during onboarding' })
  async skipProfile(@CurrentUser('id') userId: string) {
    return this.profileService.skipProfile(userId);
  }

  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update customer profile avatar' })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @Body() dto: UploadAvatarDto,
  ) {
    return this.profileService.uploadAvatar(userId, dto);
  }

  @Post('devices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register customer push notification device token' })
  async registerDevice(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.profileService.registerDevice(userId, dto);
  }

  @Post('delete-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request account deletion and deactivation' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.profileService.deleteAccount(userId);
  }

  @Get('feature-flags')
  @ApiOperation({ summary: 'Get client feature flags for current user' })
  async getFeatureFlags(@CurrentUser('id') userId: string) {
    return this.profileService.getFeatureFlags(userId);
  }
}
