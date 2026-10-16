import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PauseAreaDto {
  @ApiProperty({ description: 'Public explanation message for why bookings are paused in this area', example: 'Heavy waterlogging; operations paused for technician safety.' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ description: 'Scheduled automatic resumption time in ISO-8601' })
  @IsOptional()
  @IsDateString()
  resumeAt?: string;
}
