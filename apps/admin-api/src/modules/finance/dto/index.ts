import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutRunStatus } from '@gearzo/db';

export class CreateRefundDto {
  @ApiProperty({ description: 'Booking ID to issue refund for' })
  @IsUUID()
  bookingId!: string;

  @ApiProperty({ description: 'Refund amount in paise', example: 45000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amountPaise!: number;

  @ApiProperty({ description: 'Reason for refund' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class QueryPayoutRunsDto {
  @ApiPropertyOptional({ enum: PayoutRunStatus })
  @IsOptional()
  @IsEnum(PayoutRunStatus)
  status?: PayoutRunStatus;

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

export class MarkPayoutPaidDto {
  @ApiProperty({ description: 'Bank UTR / Transaction Reference Number', example: 'CMS1234567890' })
  @IsString()
  @IsNotEmpty()
  utr!: string;
}

export class LedgerAdjustmentDto {
  @ApiProperty({ description: 'Mechanic ID' })
  @IsUUID()
  mechanicId!: string;

  @ApiProperty({ description: 'Adjustment amount in paise (positive to credit, negative to debit)', example: 50000 })
  @Type(() => Number)
  @IsNumber()
  amountPaise!: number;

  @ApiProperty({ description: 'Detailed reason for adjustment' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
