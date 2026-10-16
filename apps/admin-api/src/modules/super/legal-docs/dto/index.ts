import { IsEnum, IsString, IsNotEmpty, IsUrl, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LegalDocType } from '@gearzo/db';

export class CreateLegalDocDto {
  @ApiProperty({ enum: LegalDocType, example: LegalDocType.TERMS })
  @IsEnum(LegalDocType)
  type!: LegalDocType;

  @ApiProperty({ description: 'Version label', example: '2026.1' })
  @IsString()
  @IsNotEmpty()
  version!: string;

  @ApiProperty({ description: 'Public document URL', example: 'https://gearzo.in/legal/terms-2026.1.html' })
  @IsUrl()
  url!: string;

  @ApiProperty({ description: 'Official publication date ISO-8601' })
  @IsDateString()
  publishedAt!: string;
}

export class UpdateLegalDocDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
