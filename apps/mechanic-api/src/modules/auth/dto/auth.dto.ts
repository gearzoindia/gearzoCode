import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString, Length, Matches } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210', description: 'Mechanic phone number in E.164 format' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 international format (e.g. +919876543210)',
  })
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/)
  phone!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'sample_refresh_token_string' })
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
