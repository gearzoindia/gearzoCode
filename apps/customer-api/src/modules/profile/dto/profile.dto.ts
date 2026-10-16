import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'rahul.sharma@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'MALE', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'Bengaluru' })
  @IsOptional()
  @IsString()
  city?: string;
}

export class RegisterDeviceDto {
  @ApiProperty({ example: 'fcm_token_sample_string_123' })
  @IsString()
  deviceToken!: string;

  @ApiProperty({ example: 'android', enum: ['ios', 'android', 'web'] })
  @IsString()
  platform!: 'ios' | 'android' | 'web';
}

export class UploadAvatarDto {
  @ApiProperty({ example: 'https://storage.gearzo.in/avatars/user-123.jpg' })
  @IsString()
  avatarUrl!: string;
}
