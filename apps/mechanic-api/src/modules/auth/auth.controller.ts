import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MechanicAuthGuard } from '../../common/guards/auth.guard';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(MechanicAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post(['otp/send', 'send-otp'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to mechanic partner mobile number' })
  @ApiResponse({ status: 200, description: 'OTP dispatched successfully' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post(['otp/verify', 'verify-otp'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and issue mechanic access & refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens issued successfully' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using valid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out current mechanic session' })
  async logout(
    @CurrentUser('id') mechanicId: string,
    @CurrentUser('sessionId') sessionId: string,
  ) {
    return this.authService.logout(mechanicId, sessionId);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out all active sessions across all mechanic devices' })
  async logoutAll(@CurrentUser('id') mechanicId: string) {
    return this.authService.logoutAll(mechanicId);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of active sessions for current mechanic' })
  async getSessions(@CurrentUser('id') mechanicId: string) {
    return this.authService.getSessions(mechanicId);
  }

  @Delete('sessions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific active mechanic session' })
  async revokeSession(
    @CurrentUser('id') mechanicId: string,
    @Param('id') sessionId: string,
  ) {
    return this.authService.revokeSession(mechanicId, sessionId);
  }
}
