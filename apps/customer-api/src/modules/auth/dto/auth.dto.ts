import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'E.164 formatted phone number',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid E.164 format (e.g. +919876543210)',
  })
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'E.164 formatted phone number',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid E.164 format (e.g. +919876543210)',
  })
  phone!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  code?: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code alias',
    required: false,
  })
  otp?: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOi...',
    description: 'Valid refresh token string',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
