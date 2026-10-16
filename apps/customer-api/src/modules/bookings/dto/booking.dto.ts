import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

export class BookingQuoteDto {
  @ApiPropertyOptional({ example: ['srv_general_service_2w'] })
  @IsOptional()
  serviceIds?: string[];

  @ApiPropertyOptional({ example: 'srv_general_service_2w' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ example: 'veh_sample_1' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ example: 'addr_sample_1' })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiPropertyOptional({ example: 'Koramangala, Bengaluru' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'GEARZO100' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class ValidateCouponDto {
  @ApiProperty({ example: 'GEARZO100' })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiProperty({ example: 99900, description: 'Order amount in paise' })
  @IsInt()
  @Min(0)
  amountPaise!: number;
}

export class CreateBookingDto {
  @ApiPropertyOptional({ example: ['srv_general_service_2w'] })
  @IsOptional()
  serviceIds?: string[];

  @ApiPropertyOptional({ example: 'srv_general_service_2w' })
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional({ example: 'veh_sample_1' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ example: 'addr_sample_1' })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiPropertyOptional({ example: 'Koramangala, Bengaluru' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 12.9352 })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: 77.6772 })
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ example: '2026-10-15T09:00:00.000Z' })
  @IsOptional()
  @IsString()
  scheduledSlotStart?: string;

  @ApiPropertyOptional({ example: '2026-10-15T09:00:00.000Z' })
  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: 'GEARZO100' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Please inspect the chain lubrication specifically.' })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiPropertyOptional({ example: 'Please inspect the chain lubrication specifically.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'ONLINE', enum: ['ONLINE', 'CASH', 'WALLET'] })
  @IsOptional()
  paymentMethod?: 'ONLINE' | 'CASH' | 'WALLET';
}

export class CancelBookingDto {
  @ApiProperty({ example: 'Customer requested reschedule' })
  @IsNotEmpty()
  @IsString()
  reason!: string;
}

export class ReviewBookingDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: ['On-time', 'Polite', 'Quick service'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Great mechanic! Solved the brake noise quickly.' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReportIssueDto {
  @ApiProperty({ example: 'PARTS_ISSUE', enum: ['PARTS_ISSUE', 'DELAY', 'BEHAVIOR', 'OTHER'] })
  @IsNotEmpty()
  @IsString()
  category!: string;

  @ApiProperty({ example: 'Brake noise still persists after test ride' })
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: ['https://storage.gearzo.in/issues/photo1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}
