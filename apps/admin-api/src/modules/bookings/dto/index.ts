import { IsOptional, IsString, IsEnum, IsBoolean, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@gearzo/db';

export class QueryBookingsDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Specific Area ID' })
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @ApiPropertyOptional({ description: 'From date (ISO-8601)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'To date (ISO-8601)' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'Search booking code or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

export class AssignBookingDto {
  @ApiProperty({ description: 'Mechanic ID to assign to this booking' })
  @IsUUID()
  mechanicId!: string;
}

export class CancelBookingDto {
  @ApiProperty({ description: 'Cancellation reason' })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({ description: 'Waive any cancellation fee', default: false })
  @IsOptional()
  @IsBoolean()
  waiveFee?: boolean = false;
}

export class AddBookingNoteDto {
  @ApiProperty({ description: 'Internal staff note' })
  @IsString()
  body!: string;
}
