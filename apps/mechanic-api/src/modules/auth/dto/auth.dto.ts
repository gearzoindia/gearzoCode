import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Mechanic phone number' })
  @IsNotEmpty()
  @IsString()
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code', required: false })
  @IsOptional()
  @IsString()
  otp?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'sample_refresh_token_string' })
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
