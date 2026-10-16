import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Platform, RegistrationType, ServiceMode } from '@gearzo/db';

export class UpdateMechanicProfileDto {
  @ApiPropertyOptional({ example: 'Ramesh Kumar' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'https://cdn.gearzo.in/avatars/mech_1.jpg' })
  @IsOptional()
  @IsString()
  photoKey?: string;

  @ApiPropertyOptional({ example: 'Sri Balaji Auto Garage' })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiPropertyOptional({ example: '12th Main, 4th Block, Jayanagar, Bengaluru' })
  @IsOptional()
  @IsString()
  shopAddress?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  shopCapacity?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @ApiPropertyOptional({ example: ['English', 'Hindi', 'Kannada'] })
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiPropertyOptional({ example: '1988-06-15' })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  serviceRadiusKm?: number;
}

export class RegisterDeviceDto {
  @ApiProperty({ example: 'fcm_token_sample_string_12345' })
  @IsNotEmpty()
  @IsString()
  token!: string;

  @ApiProperty({ enum: ['IOS', 'ANDROID', 'WEB'], example: 'ANDROID' })
  @IsNotEmpty()
  @IsEnum(Platform)
  platform!: Platform;
}
