import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsObject,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IncentiveType, IncentiveScope } from '@gearzo/db';

export class CreateIncentiveRuleDto {
  @ApiProperty({ description: 'Campaign title', example: 'Weekend Peak Surge Bonus' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: IncentiveType, example: IncentiveType.PEAK_BONUS })
  @IsEnum(IncentiveType)
  type!: IncentiveType;

  @ApiProperty({ description: 'Rule parameters (thresholds, bonusPaise, criteria)', example: { bonusPaise: 5000, minJobs: 3 } })
  @IsObject()
  params!: Record<string, any>;

  @ApiProperty({ enum: IncentiveScope, example: IncentiveScope.CITY_SCOPE })
  @IsEnum(IncentiveScope)
  scope!: IncentiveScope;

  @ApiPropertyOptional({ description: 'City or Area UUID' })
  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @ApiProperty({ description: 'Campaign start timestamp' })
  @IsDateString()
  startsAt!: string;

  @ApiPropertyOptional({ description: 'Campaign end timestamp' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateIncentiveRuleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: IncentiveType })
  @IsOptional()
  @IsEnum(IncentiveType)
  type?: IncentiveType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  @ApiPropertyOptional({ enum: IncentiveScope })
  @IsOptional()
  @IsEnum(IncentiveScope)
  scope?: IncentiveScope;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
