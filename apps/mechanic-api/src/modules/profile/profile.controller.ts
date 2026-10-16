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
import { UpdateMechanicProfileDto, RegisterDeviceDto } from './dto/profile.dto';
import { MechanicAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Profile')
@Controller('me')
@UseGuards(MechanicAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current mechanic profile details' })
  async getProfile(@CurrentUser('id') mechanicId: string) {
    return this.profileService.getProfile(mechanicId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update current mechanic profile details' })
  async updateProfile(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: UpdateMechanicProfileDto,
  ) {
    return this.profileService.updateProfile(mechanicId, dto);
  }

  @Post('devices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register mechanic push notification device token' })
  async registerDevice(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: RegisterDeviceDto,
  ) {
    return this.profileService.registerDevice(mechanicId, dto);
  }
}
