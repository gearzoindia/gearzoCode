import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Audience } from '@gearzo/db';

export class CreateBroadcastDto {
  @ApiProperty({ enum: Audience, example: Audience.CUSTOMER })
  @IsEnum(Audience)
  audience!: Audience;

  @ApiProperty({ description: 'Push notification or announcement title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Announcement body text' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ description: 'Targeting filters (e.g. areaIds, vehicleTypes)' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Scheduled dispatch time in ISO-8601' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
