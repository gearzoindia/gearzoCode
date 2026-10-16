import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class EarningsLedgerQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  limit?: number;
}

export class PayDuesDto {
  @ApiPropertyOptional({ example: 25000, description: 'Amount to pay in paise. If omitted, full outstanding dues amount is used.' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(100)
  amountPaise?: number;
}
