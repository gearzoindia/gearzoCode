import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchServiceDto {
  @ApiPropertyOptional({ example: 'oil change' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 'vt_2w' })
  @IsOptional()
  @IsString()
  vehicleTypeId?: string;

  @ApiPropertyOptional({ example: 'area_blr_koramangala' })
  @IsOptional()
  @IsString()
  areaId?: string;

  @ApiPropertyOptional({ example: 'cat_maintenance' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
