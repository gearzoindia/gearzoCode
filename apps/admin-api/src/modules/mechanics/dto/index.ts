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
  @ApiPropertyOptional({ type: [ReviewDocumentItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewDocumentItemDto)
  documents?: ReviewDocumentItemDto[];

  @ApiPropertyOptional({ enum: ['VERIFIED', 'APPROVED', 'REJECTED'], description: 'Overall mechanic verification status' })
  @IsOptional()
  @IsString()
  status?: 'VERIFIED' | 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ description: 'Auditor review notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Optional rejection reason' })
  @IsOptional()
  @IsString()
  reason?: string;

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

export class CreateMechanicDto {
  @ApiProperty({ description: 'Mechanic full name', example: 'Rajesh Kumar' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Mechanic mobile number', example: '+919876543210' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ enum: ['INDIVIDUAL', 'SHOP', 'DIRECT_JOB'], default: 'INDIVIDUAL' })
  @IsOptional()
  @IsString()
  registrationType?: 'INDIVIDUAL' | 'SHOP' | 'DIRECT_JOB' = 'INDIVIDUAL';

  @ApiPropertyOptional({ description: 'Workshop / Garage name' })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiPropertyOptional({ description: 'Years of professional experience', default: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  experienceYears?: number = 3;

  @ApiPropertyOptional({ description: 'Service radius in km', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  serviceRadiusKm?: number = 10;

  @ApiPropertyOptional({ description: 'Vehicle types serviced', example: ['TWO_WHEELER'] })
  @IsOptional()
  @IsArray()
  vehicleTypes?: string[] = ['TWO_WHEELER'];

  @ApiPropertyOptional({ enum: MechanicStatus, default: MechanicStatus.APPROVED })
  @IsOptional()
  @IsEnum(MechanicStatus)
  status?: MechanicStatus = MechanicStatus.APPROVED;

  @ApiPropertyOptional({ description: 'Area jurisdiction UUID' })
  @IsOptional()
  @IsUUID()
  areaId?: string;
}
