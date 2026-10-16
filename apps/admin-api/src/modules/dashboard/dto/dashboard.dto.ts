import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardFilterDto {
  @ApiPropertyOptional({ description: 'Range: today, 7d, 30d, 90d, custom', default: 'today' })
  @IsOptional()
  @IsString()
  range?: string;

  @ApiPropertyOptional({ description: 'Specific jurisdiction ID within authorized subtree' })
  @IsOptional()
  @IsString()
  jurisdictionId?: string;
}

export class LiveMapDto {
  @ApiPropertyOptional({ description: 'Bounding box: minLng,minLat,maxLng,maxLat', example: '77.5,12.9,77.7,13.1' })
  @IsOptional()
  @IsString()
  bbox?: string;

  @ApiPropertyOptional({ description: 'Specific area ID' })
  @IsOptional()
  @IsString()
  areaId?: string;
}
