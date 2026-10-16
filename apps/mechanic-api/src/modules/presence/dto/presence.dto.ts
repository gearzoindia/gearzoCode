import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GoOnlineDto {
  @ApiProperty({ example: 12.9716, description: 'Current latitude' })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 77.5946, description: 'Current longitude' })
  @IsNumber()
  lng!: number;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 12.9716 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 77.5946 })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({ example: 15.5, description: 'Speed in km/h' })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ example: 90.0, description: 'Heading in degrees' })
  @IsOptional()
  @IsNumber()
  heading?: number;
}

export class WeekdayAvailabilityDto {
  @ApiProperty({ example: 1, description: '0=Sunday, 1=Monday ... 6=Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @ApiProperty({ example: '09:00' })
  @IsNotEmpty()
  @IsString()
  startTime!: string;

  @ApiProperty({ example: '19:00' })
  @IsNotEmpty()
  @IsString()
  endTime!: string;
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [WeekdayAvailabilityDto] })
  @IsArray()
  weeklyHours!: WeekdayAvailabilityDto[];

  @ApiPropertyOptional({ example: ['2026-10-25', '2026-11-01'], description: 'Planned leave dates YYYY-MM-DD' })
  @IsOptional()
  @IsArray()
  leaveDates?: string[];
}
