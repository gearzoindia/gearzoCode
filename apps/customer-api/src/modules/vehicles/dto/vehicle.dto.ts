import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateVehicleDto {
  @ApiPropertyOptional({ example: 'FOUR_WHEELER' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'vt_4w' })
  @IsOptional()
  @IsString()
  vehicleTypeId?: string;

  @ApiPropertyOptional({ example: 'Maruti Suzuki' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 'brand_id' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ example: 'Swift' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'model_id' })
  @IsOptional()
  @IsString()
  modelId?: string;

  @ApiProperty({
    example: 'KA01AB1234',
    description: 'Vehicle registration number (uppercase, unique per customer)',
  })
  @IsNotEmpty()
  @IsString()
  registrationNumber!: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  year?: any;

  @ApiPropertyOptional({ example: 'PETROL' })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: '2023' })
  @IsOptional()
  year?: any;

  @ApiPropertyOptional({ example: 'ELECTRIC' })
  @IsOptional()
  @IsString()
  fuelType?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
