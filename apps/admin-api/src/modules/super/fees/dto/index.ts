import {
  IsEnum,
  IsInt,
  Min,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeeType, ValueType } from '@gearzo/db';

export class SetFeeRuleDto {
  @ApiProperty({ enum: FeeType, example: FeeType.PLATFORM_FEE })
  @IsEnum(FeeType)
  type!: FeeType;

  @ApiProperty({ description: 'Fee value (paise if FLAT, e.g. 2900 = ₹29; percent if PERCENT, e.g. 18 = 18%)', example: 2900 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  value!: number;

  @ApiProperty({ enum: ValueType, example: ValueType.FLAT })
  @IsEnum(ValueType)
  valueType!: ValueType;

  @ApiPropertyOptional({ description: 'City UUID (null for global baseline fee)' })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiProperty({ description: 'Effective date in ISO-8601' })
  @IsDateString()
  effectiveFrom!: string;
}
