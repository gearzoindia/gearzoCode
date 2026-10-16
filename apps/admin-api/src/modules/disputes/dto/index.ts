import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeStatus } from '@gearzo/db';

export class QueryDisputesDto {
  @ApiPropertyOptional({ enum: DisputeStatus })
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @ApiPropertyOptional({ description: 'From date (ISO-8601)' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'To date (ISO-8601)' })
  @IsOptional()
  @IsString()
  to?: string;

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

export class AddDisputeMessageDto {
  @ApiProperty({ description: 'Message body' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({ description: 'True if internal note hidden from customer/mechanic', default: false })
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean = false;

  @ApiPropertyOptional({ type: [String], description: 'Optional attachment file keys' })
  @IsOptional()
  @IsArray()
  attachments?: string[] = [];
}

export class ResolveDisputeDto {
  @ApiProperty({ description: 'Resolution explanation' })
  @IsString()
  @IsNotEmpty()
  resolution!: string;

  @ApiPropertyOptional({ description: 'Optional refund amount to customer in paise' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  refundPaise?: number;

  @ApiPropertyOptional({ description: 'Optional penalty amount deducted from mechanic in paise' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  mechanicPenaltyPaise?: number;

  @ApiPropertyOptional({ description: 'Internal settlement note' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class EscalateDisputeDto {
  @ApiProperty({ description: 'Reason for escalating dispute to higher admin tier' })
  @IsString()
  @IsNotEmpty()
  note!: string;
}
