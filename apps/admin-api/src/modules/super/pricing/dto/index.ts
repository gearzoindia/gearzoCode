import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleType } from '@gearzo/db';

export class QueryPricingMatrixDto {
  @ApiPropertyOptional({ description: 'Filter by Service ID' })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional({ enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiPropertyOptional({ description: 'Filter by specific Vehicle Model ID' })
  @IsOptional()
  @IsUUID()
  modelId?: string;

  @ApiPropertyOptional({ description: 'Filter by specific Area ID' })
  @IsOptional()
  @IsUUID()
  areaId?: string;
}

export class SetPricingEntryDto {
  @ApiProperty({ description: 'Service UUID' })
  @IsUUID()
  serviceId!: string;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  vehicleType!: VehicleType;

  @ApiPropertyOptional({ description: 'Vehicle model ID (null for all models of vehicle type)' })
  @IsOptional()
  @IsUUID()
  modelId?: string;

  @ApiPropertyOptional({ description: 'Area ID (null for base fallback pricing)' })
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @ApiProperty({ description: 'Price in paise (e.g. 49900 = ₹499.00)', example: 49900 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePaise!: number;
}

export class BulkSetPricingDto {
  @ApiProperty({ type: [SetPricingEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetPricingEntryDto)
  entries!: SetPricingEntryDto[];
}

export class ImportPricingCsvDto {
  @ApiProperty({ description: 'Raw CSV text with columns: serviceId,vehicleType,modelId,areaId,pricePaise' })
  @IsString()
  csvContent!: string;
}
