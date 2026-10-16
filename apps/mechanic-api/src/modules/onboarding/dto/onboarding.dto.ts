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
} from 'class-validator';
import { DocType, RegistrationType, ServiceMode, VehicleType } from '@gearzo/db';

export class SetRegistrationTypeDto {
  @ApiProperty({ enum: ['SHOP', 'INDIVIDUAL', 'DIRECT_JOB'], example: 'SHOP' })
  @IsNotEmpty()
  @IsEnum(RegistrationType)
  registrationType!: RegistrationType;
}

export class SaveOnboardingProfileDto {
  @ApiProperty({ example: 'Ramesh Kumar' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Sri Balaji Auto Care' })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiPropertyOptional({ example: 'Plot 45, 1st Cross, HSR Layout Sector 2' })
  @IsOptional()
  @IsString()
  shopAddress?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  shopCapacity?: number;

  @ApiProperty({ example: 6 })
  @IsInt()
  @Min(0)
  experienceYears!: number;

  @ApiProperty({ example: ['English', 'Hindi', 'Kannada'] })
  @IsArray()
  languages!: string[];

  @ApiPropertyOptional({ example: '1990-05-20' })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiProperty({ enum: ['DOORSTEP', 'GARAGE_VISIT', 'PICKUP_DROP', 'TOWING'], isArray: true })
  @IsArray()
  serviceModes!: ServiceMode[];
}

export class SaveSkillsDto {
  @ApiProperty({ enum: ['TWO_WHEELER', 'THREE_WHEELER', 'FOUR_WHEELER'], isArray: true })
  @IsArray()
  vehicleTypes!: VehicleType[];

  @ApiProperty({ example: ['srv_uuid_1', 'srv_uuid_2'] })
  @IsArray()
  serviceIds!: string[];

  @ApiPropertyOptional({ example: ['OBD2_SCANNER', 'AIR_COMPRESSOR', 'HYDRAULIC_JACK'] })
  @IsOptional()
  @IsArray()
  equipmentCodes?: string[];
}

export class SaveLocationDto {
  @ApiProperty({ example: 12.9716, description: 'Base location latitude' })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 77.5946, description: 'Base location longitude' })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({ example: 10, default: 5, description: 'Operating service radius in KM' })
  @IsOptional()
  @IsInt()
  @Min(1)
  serviceRadiusKm?: number;
}

export class GetDocUploadUrlDto {
  @ApiProperty({ enum: DocType, example: 'AADHAAR_FRONT' })
  @IsNotEmpty()
  @IsEnum(DocType)
  docType!: DocType;

  @ApiProperty({ example: 'aadhaar_front.jpg' })
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsNotEmpty()
  @IsString()
  mimeType!: string;
}

export class SubmitDocDto {
  @ApiProperty({ enum: DocType, example: 'AADHAAR_FRONT' })
  @IsNotEmpty()
  @IsEnum(DocType)
  docType!: DocType;

  @ApiProperty({ example: 'docs/mech_123/aadhaar_front.jpg' })
  @IsNotEmpty()
  @IsString()
  fileKey!: string;

  @ApiPropertyOptional({ example: '1234' })
  @IsOptional()
  @IsString()
  numberLast4?: string;
}

export class SubmitKycDto {
  @ApiProperty({ type: [SubmitDocDto] })
  @IsArray()
  documents!: SubmitDocDto[];
}

export class SaveBankDetailsDto {
  @ApiProperty({ example: 'Ramesh Kumar' })
  @IsNotEmpty()
  @IsString()
  holderName!: string;

  @ApiPropertyOptional({ example: '987654321012' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'HDFC0001234' })
  @IsOptional()
  @IsString()
  ifsc?: string;

  @ApiPropertyOptional({ example: 'ramesh@oksbi' })
  @IsOptional()
  @IsString()
  upiId?: string;

  @ApiPropertyOptional({ example: '123456', description: 'Mandatory OTP if mechanic is already APPROVED' })
  @IsOptional()
  @IsString()
  otpCode?: string;
}
