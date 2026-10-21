import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginDto,
  VerifyOtpDto,
  Verify2faDto,
  RefreshTokenDto,
  AcceptInviteDto,
  ConfirmTotpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  ReAuthDto,
} from './dto';
import { Public, CurrentAdmin, AuthenticatedAdmin } from '../../common/decorators';
import { AdminAuthGuard } from '../../common/guards';
import { Request } from 'express';

@ApiTags('Admin Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login step 1 (Password validation & OTP challenge)' })
  @ApiResponse({ status: 200, description: 'Credentials valid, OTP challenge issued' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.login(dto, ip, userAgent);
  }

  @Public()
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login step 2 (OTP verification -> TOTP challenge or tokens)' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.verifyOtp(dto, ip, userAgent);
  }

  @Public()
  @Post(['2fa/verify', 'totp/verify'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login step 3 (TOTP authenticator verification -> tokens)' })
  async verify2fa(
    @Body() dto: Verify2faDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.verify2fa(dto, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token' })
  async refresh(@Body() dto: RefreshTokenDto, @Ip() ip: string) {
    return this.authService.refresh(dto.refreshToken, ip);
  }

  @Post('logout')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current session' })
  async logout(@Req() req: Request) {
    const sessionId = (req as any).user?.sessionId || 'default';
    return this.authService.logout(sessionId);
  }

  @Post('logout-all')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout all sessions and bump tokenVersion' })
  async logoutAll(@CurrentAdmin('id') adminId: string) {
    return this.authService.logoutAll(adminId);
  }

  @Public()
  @Post('invite/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept admin invitation and set password' })
  async acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.authService.acceptInvite(dto);
  }

  @Post('2fa/setup')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate TOTP secret and QR code URI' })
  async setup2fa(@CurrentAdmin('id') adminId: string) {
    return this.authService.setup2fa(adminId);
  }

  @Post('2fa/confirm')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA code, enable TOTP, and obtain recovery codes' })
  async confirm2fa(
    @CurrentAdmin('id') adminId: string,
    @Body() dto: ConfirmTotpDto,
  ) {
    return this.authService.confirm2fa(adminId, dto.code);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Initiate password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete password reset with OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('password/change')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password and revoke other sessions' })
  async changePassword(
    @CurrentAdmin('id') adminId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(adminId, dto);
  }

  @Post('re-auth')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-authenticate with password for 5-minute sensitive actions window' })
  async reAuth(
    @CurrentAdmin('id') adminId: string,
    @Body() dto: ReAuthDto,
  ) {
    return this.authService.reAuth(adminId, dto);
  }

  @Get('me')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile and effective permissions' })
  async getMe(@CurrentAdmin('id') adminId: string) {
    return this.authService.getMe(adminId);
  }
}
