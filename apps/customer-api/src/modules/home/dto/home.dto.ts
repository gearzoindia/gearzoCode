import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class HomeQueryDto {
  @ApiPropertyOptional({ example: 12.9716, description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 77.5946, description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  lng?: number;
}
