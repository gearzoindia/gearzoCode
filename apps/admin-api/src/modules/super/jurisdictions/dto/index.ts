import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JurisdictionLevel } from '@gearzo/db';

export class CreateJurisdictionDto {
  @ApiProperty({ description: 'Jurisdiction name (e.g. Bangalore South, Koramangala)' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: JurisdictionLevel, example: JurisdictionLevel.AREA })
  @IsEnum(JurisdictionLevel)
  level!: JurisdictionLevel;

  @ApiPropertyOptional({ description: 'Parent jurisdiction ID (null for top-level division)' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'City ID' })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({ description: 'GeoJSON polygon coordinates representation' })
  @IsOptional()
  @IsObject()
  polygon?: Record<string, any>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateJurisdictionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  polygon?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
