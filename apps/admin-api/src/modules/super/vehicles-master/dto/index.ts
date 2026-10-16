import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType, FuelType } from '@gearzo/db';

export class CreateVehicleBrandDto {
  @ApiProperty({ description: 'Brand name', example: 'Honda' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Logo image URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ enum: VehicleType, isArray: true, example: [VehicleType.TWO_WHEELER, VehicleType.FOUR_WHEELER] })
  @IsArray()
  types!: VehicleType[];

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

export class UpdateVehicleBrandDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ enum: VehicleType, isArray: true })
  @IsOptional()
  @IsArray()
  types?: VehicleType[];

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

export class CreateVehicleModelDto {
  @ApiProperty({ description: 'Vehicle brand UUID' })
  @IsUUID()
  brandId!: string;

  @ApiProperty({ description: 'Model name', example: 'Activa 6G' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: VehicleType, example: VehicleType.TWO_WHEELER })
  @IsEnum(VehicleType)
  type!: VehicleType;

  @ApiProperty({ enum: FuelType, isArray: true, example: [FuelType.PETROL] })
  @IsArray()
  fuelTypes!: FuelType[];

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

export class UpdateVehicleModelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

  @ApiPropertyOptional({ enum: FuelType, isArray: true })
  @IsOptional()
  @IsArray()
  fuelTypes?: FuelType[];

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

export class MergeCustomModelDto {
  @ApiProperty({ description: 'Custom model name string to merge' })
  @IsString()
  @IsNotEmpty()
  customModelName!: string;

  @ApiProperty({ description: 'Target official model UUID to merge into' })
  @IsUUID()
  targetModelId!: string;
}
