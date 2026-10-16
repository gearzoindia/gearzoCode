import {
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Scope } from '@gearzo/db';

export class SetCommissionRuleDto {
  @ApiProperty({ enum: Scope, example: Scope.GLOBAL })
  @IsEnum(Scope)
  scope!: Scope;

  @ApiPropertyOptional({ description: 'Scope entity UUID (null if GLOBAL)' })
  @IsOptional()
  @IsUUID()
  scopeId?: string;

  @ApiProperty({ description: 'Commission percentage (e.g. 15.5 for 15.5%)', example: 15.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  percent!: number;

  @ApiProperty({ description: 'Effective date in ISO-8601' })
  @IsDateString()
  effectiveFrom!: string;
}
