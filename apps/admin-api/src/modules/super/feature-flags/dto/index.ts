import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeatureFlagDto {
  @ApiProperty({ description: 'Feature flag unique key', example: 'enable_instant_tow_service' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean = false;

  @ApiPropertyOptional({
    description: 'Targeting rules: apps: string[], cities: string[], rolloutPercent: number',
    example: { apps: ['CUSTOMER_APP'], rolloutPercent: 50 },
  })
  @IsOptional()
  @IsObject()
  rules?: Record<string, any>;
}

export class UpdateFeatureFlagDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  rules?: Record<string, any>;
}
