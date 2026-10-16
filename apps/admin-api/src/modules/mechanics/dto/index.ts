import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MechanicStatus, DocStatus } from '@gearzo/db';

export class QueryMechanicsDto {
  @ApiPropertyOptional({ enum: MechanicStatus })
  @IsOptional()
  @IsEnum(MechanicStatus)
  status?: MechanicStatus;

  @ApiPropertyOptional({ description: 'Filter by specific Area ID' })
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @ApiPropertyOptional({ description: 'Search by name or phone' })
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

export class ReviewDocumentItemDto {
  @ApiProperty({ description: 'Mechanic document UUID' })
  @IsUUID()
  docId!: string;

  @ApiProperty({ enum: ['APPROVED_DOC', 'REJECTED_DOC'], example: 'APPROVED_DOC' })
  @IsString()
  status!: 'APPROVED_DOC' | 'REJECTED_DOC';

  @ApiPropertyOptional({ description: 'Reason if rejecting' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class ReviewKycDto {
  @ApiProperty({ type: [ReviewDocumentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewDocumentItemDto)
  documents!: ReviewDocumentItemDto[];

  @ApiPropertyOptional({ description: 'Approve background declaration if applicable' })
  @IsOptional()
  @IsString()
  backgroundStatus?: 'APPROVED_BG' | 'REJECTED_BG';
}

export class SuspendMechanicDto {
  @ApiProperty({ description: 'Reason for suspension' })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({ description: 'Duration in days (leave empty for indefinite)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  durationDays?: number;
}
