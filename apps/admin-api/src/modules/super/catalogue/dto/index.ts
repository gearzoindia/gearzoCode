import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsEnum,
  IsArray,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PriceType, VehicleType, ServiceMode } from '@gearzo/db';

export class CreateServiceCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'General Maintenance' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Icon asset URL' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number = 0;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean = false;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateServiceCategoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmergency?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateServiceDto {
  @ApiProperty({ description: 'Category UUID' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ description: 'Service title', example: 'Comprehensive Engine Oil Service' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Full service description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Items/procedures included' })
  @IsOptional()
  @IsArray()
  includes?: string[] = [];

  @ApiPropertyOptional({ type: [String], description: 'Items/procedures excluded' })
  @IsOptional()
  @IsArray()
  excludes?: string[] = [];

  @ApiProperty({ description: 'Estimated execution duration in minutes', example: 45 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  durationMin!: number;

  @ApiPropertyOptional({ enum: PriceType, default: PriceType.FIXED, example: PriceType.FIXED })
  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType = PriceType.FIXED;

  @ApiPropertyOptional({ description: 'Base rate in Rupees' })
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ description: 'Base rate in Paise' })
  @IsOptional()
  @Type(() => Number)
  basePricePaise?: number;

  @ApiProperty({ enum: VehicleType, isArray: true, example: [VehicleType.TWO_WHEELER] })
  @IsArray()
  vehicleTypes!: VehicleType[];

  @ApiProperty({ enum: ServiceMode, isArray: true, example: [ServiceMode.DOORSTEP] })
  @IsArray()
  allowedModes!: ServiceMode[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPackage?: boolean = false;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number = 0;
}

export class UpdateServiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  includes?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  excludes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  durationMin?: number;

  @ApiPropertyOptional({ enum: PriceType })
  @IsOptional()
  @IsEnum(PriceType)
  priceType?: PriceType;

  @ApiPropertyOptional({ enum: VehicleType, isArray: true })
  @IsOptional()
  @IsArray()
  vehicleTypes?: VehicleType[];

  @ApiPropertyOptional({ enum: ServiceMode, isArray: true })
  @IsOptional()
  @IsArray()
  allowedModes?: ServiceMode[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPackage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}
