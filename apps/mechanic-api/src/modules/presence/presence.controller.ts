import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PresenceService } from './presence.service';
import {
  GoOnlineDto,
  UpdateLocationDto,
  SetAvailabilityDto,
} from './dto/presence.dto';
import { MechanicAuthGuard } from '../../common/guards/auth.guard';
import { RequireMechanicStatusGuard } from '../../common/guards/mechanic-status.guard';
import { RequireMechanicStatus } from '../../common/decorators/require-mechanic-status.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Presence')
@Controller(['', 'mechanic'])
@UseGuards(MechanicAuthGuard, RequireMechanicStatusGuard)
@RequireMechanicStatus('APPROVED')
@ApiBearerAuth()
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Post(['duty/toggle', 'presence/toggle'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle mechanic duty status online or offline' })
  async toggleDuty(
    @CurrentUser('id') mechanicId: string,
    @Body() body: { isOnline: boolean },
  ) {
    if (body.isOnline) {
      await this.presenceService.goOnline(mechanicId, { lat: 12.9352, lng: 77.6772 } as any);
      return { isOnline: true };
    } else {
      await this.presenceService.goOffline(mechanicId);
      return { isOnline: false };
    }
  }

  @Post('presence/online')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Go online to receive on-demand service job offers' })
  async goOnline(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: GoOnlineDto,
  ) {
    return this.presenceService.goOnline(mechanicId, dto);
  }

  @Post('presence/offline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Go offline and pause job dispatch' })
  async goOffline(@CurrentUser('id') mechanicId: string) {
    return this.presenceService.goOffline(mechanicId);
  }

  @Post('presence/location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update live GPS coordinates for dispatch and geofencing' })
  async updateLocation(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.presenceService.updateLocation(mechanicId, dto);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get working schedule hours and approved leave days' })
  async getAvailability(@CurrentUser('id') mechanicId: string) {
    return this.presenceService.getAvailability(mechanicId);
  }

  @Put('availability')
  @ApiOperation({ summary: 'Set working schedule hours and schedule future leaves' })
  async setAvailability(
    @CurrentUser('id') mechanicId: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.presenceService.setAvailability(mechanicId, dto);
  }
}
