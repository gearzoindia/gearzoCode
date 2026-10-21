import { IsString, IsNotEmpty, IsOptional, MinLength, Length, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({ description: 'Email or E.164 phone number', example: 'admin@gearzo.in' })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiPropertyOptional({ description: 'Email alias for identifier', example: 'admin@gearzo.in' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Password', example: 'SecretP@ssw0rd!' })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'Challenge ID received from login' })
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

  @ApiProperty({ description: '6-digit OTP', example: '123456' })
  @IsString()
  @Length(6, 6)
  otp!: string;
}

export class Verify2faDto {
  @ApiProperty({ description: 'Challenge ID received from login/otp' })
  @IsString()
  @IsNotEmpty()
  challengeId!: string;

  @ApiProperty({ description: '6-digit TOTP code', example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;

  @ApiProperty({ description: 'Target audience', required: false })
  @IsString()
  @IsOptional()
  audience?: string;
}

export class AcceptInviteDto {
  @ApiProperty({ description: 'Invite token received in email/link' })
  @IsString()
  @IsNotEmpty()
  inviteToken!: string;

  @ApiProperty({ description: 'New password', example: 'SuperSecureP@ss123' })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class ConfirmTotpDto {
  @ApiProperty({ description: '6-digit TOTP code from authenticator app', example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email or phone identifier' })
  @IsString()
  @IsNotEmpty()
  identifier!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token received via email/sms' })
  @IsString()
  @IsNotEmpty()
  resetToken!: string;

  @ApiProperty({ description: '6-digit OTP' })
  @IsString()
  @Length(6, 6)
  otp!: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ReAuthDto {
  @ApiProperty({ description: 'Current password for sensitive action confirmation' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
