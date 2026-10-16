import {
  IsEnum,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Scope, PaymentPolicy, ValueType } from '@gearzo/db';

export class CreatePaymentPolicyDto {
  @ApiProperty({ enum: Scope, example: Scope.GLOBAL })
  @IsEnum(Scope)
  scope!: Scope;

  @ApiPropertyOptional({ description: 'Entity UUID for non-global scopes' })
  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @ApiProperty({ enum: PaymentPolicy, example: PaymentPolicy.POSTPAID })
  @IsEnum(PaymentPolicy)
  policy!: PaymentPolicy;

  @ApiPropertyOptional({ enum: ValueType, description: 'Required if policy is ADVANCE' })
  @IsOptional()
  @IsEnum(ValueType)
  advanceType?: ValueType;

  @ApiPropertyOptional({ description: 'Advance amount (paise if FLAT, % if PERCENT)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  advanceValue?: number;

  @ApiProperty({ description: 'Effective date in ISO-8601' })
  @IsDateString()
  effectiveFrom!: string;
}

export class UpdatePaymentPolicyDto {
  @ApiPropertyOptional({ enum: PaymentPolicy })
  @IsOptional()
  @IsEnum(PaymentPolicy)
  policy?: PaymentPolicy;

  @ApiPropertyOptional({ enum: ValueType })
  @IsOptional()
  @IsEnum(ValueType)
  advanceType?: ValueType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  advanceValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;
}
