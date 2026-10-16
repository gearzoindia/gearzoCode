import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AddressLabel } from '@gearzo/db';

export class CreateAddressDto {
  @ApiPropertyOptional({ enum: ['HOME', 'WORK', 'OTHER'], default: 'HOME' })
  @IsOptional()
  @IsEnum(AddressLabel)
  label?: AddressLabel;

  @ApiProperty({ example: 'Flat 402, Sunshine Apartments' })
  @IsNotEmpty()
  @IsString()
  line1!: string;

  @ApiPropertyOptional({ example: '100ft Road, Indiranagar' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiPropertyOptional({ example: 'Near Metro Pillar 84' })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiProperty({ example: 12.9716, description: 'Latitude' })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 77.5946, description: 'Longitude' })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ enum: ['HOME', 'WORK', 'OTHER'] })
  @IsOptional()
  @IsEnum(AddressLabel)
  label?: AddressLabel;

  @ApiPropertyOptional({ example: 'Flat 402, Sunshine Apartments' })
  @IsOptional()
  @IsString()
  line1?: string;

  @ApiPropertyOptional({ example: '100ft Road, Indiranagar' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiPropertyOptional({ example: 'Near Metro Pillar 84' })
  @IsOptional()
  @IsString()
  landmark?: string;

  @ApiPropertyOptional({ example: 12.9716 })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 77.5946 })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
