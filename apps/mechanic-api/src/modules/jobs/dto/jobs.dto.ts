import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ItemType, PhotoType, PaymentMethodType } from '@gearzo/db';

export class ListJobsQueryDto {
  @ApiPropertyOptional({ enum: ['upcoming', 'ongoing', 'past', 'all'], default: 'ongoing' })
  @IsOptional()
  @IsString()
  tab?: 'upcoming' | 'ongoing' | 'past' | 'all';

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  limit?: number;
}

export class ArrivedDto {
  @ApiProperty({ example: 12.9716, description: 'Current latitude for 200m geofence validation' })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 77.5946, description: 'Current longitude for 200m geofence validation' })
  @IsNumber()
  lng!: number;
}

export class StartJobDto {
  @ApiProperty({ example: '4821', description: '4-digit customer service start OTP' })
  @IsNotEmpty()
  @IsString()
  @Length(4, 4)
  otp!: string;
}

export class CompleteJobDto {
  @ApiPropertyOptional({ example: 'Completed periodic service and brake pads inspection' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AddExtraDto {
  @ApiProperty({ example: 'Brake Disc Replacement' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: ['PART', 'EXTRA', 'FEE'], example: 'PART' })
  @IsNotEmpty()
  @IsEnum(ItemType)
  type!: ItemType;

  @ApiProperty({ example: 120000, description: 'Price in paise (e.g. 120000 = ₹1,200)' })
  @IsInt()
  @IsPositive()
  pricePaise!: number;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  qty?: number;

  @ApiPropertyOptional({ example: 'photos/parts/brake_disc.jpg' })
  @IsOptional()
  @IsString()
  photoKey?: string;
}

export class JobPhotoUploadUrlDto {
  @ApiProperty({ enum: ['BEFORE', 'AFTER', 'EXTRA_PHOTO'], example: 'BEFORE' })
  @IsNotEmpty()
  @IsEnum(PhotoType)
  type!: PhotoType;

  @ApiProperty({ example: 'car_engine_before.jpg' })
  @IsNotEmpty()
  @IsString()
  fileName!: string;
}

export class PaymentReceivedDto {
  @ApiProperty({ enum: ['CASH', 'UPI_DIRECT'], example: 'CASH' })
  @IsNotEmpty()
  @IsEnum(PaymentMethodType)
  method!: PaymentMethodType;

  @ApiProperty({ example: 245000, description: 'Amount collected from customer in paise' })
  @IsInt()
  @IsPositive()
  amountPaise!: number;
}

export class CancelJobDto {
  @ApiProperty({ example: 'Customer requested reschedule or cannot contact customer' })
  @IsNotEmpty()
  @IsString()
  reason!: string;
}

export class RateCustomerDto {
  @ApiProperty({ example: 5, description: 'Rating 1 to 5 stars' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Polite customer, car was ready for service' })
  @IsOptional()
  @IsString()
  comment?: string;
}
