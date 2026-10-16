import { IsBoolean, IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppType } from '@gearzo/db';

export class SetMaintenanceDto {
  @ApiProperty({ description: 'Whether maintenance mode is active', example: true })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({ description: 'Maintenance advisory message displayed to users', example: 'Scheduled database optimization in progress. Back shortly.' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ description: 'Estimated time of completion (e.g. 2026-10-13T06:00:00Z or "45 minutes")' })
  @IsOptional()
  @IsString()
  eta?: string;

  @ApiProperty({ enum: AppType, isArray: true, example: [AppType.CUSTOMER_APP, AppType.MECHANIC_APP] })
  @IsArray()
  apps!: AppType[];
}
