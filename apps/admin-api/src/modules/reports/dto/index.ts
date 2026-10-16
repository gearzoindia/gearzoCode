import { IsString, IsOptional, IsEnum, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryReportDto {
  @ApiPropertyOptional({ description: 'Range: today, 7d, 30d, 90d', default: '30d' })
  @IsOptional()
  @IsString()
  range?: string = '30d';

  @ApiPropertyOptional({ description: 'Jurisdiction ID within authorized subtree' })
  @IsOptional()
  @IsString()
  jurisdictionId?: string;
}

export class CreateExportDto {
  @ApiProperty({ description: 'Report type: bookings, revenue, mechanics, customers, audit', example: 'bookings' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiPropertyOptional({ description: 'Export format: csv or xlsx', default: 'csv' })
  @IsOptional()
  @IsEnum(['csv', 'xlsx'])
  format?: 'csv' | 'xlsx' = 'csv';

  @ApiPropertyOptional({ description: 'Filter parameters for export' })
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}
