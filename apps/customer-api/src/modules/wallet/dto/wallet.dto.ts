import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class TopupWalletDto {
  @ApiProperty({ example: 50000, description: 'Amount in paise (e.g. 50000 = ₹500)' })
  @IsInt()
  @IsPositive()
  @Min(1000)
  amountPaise!: number;
}

export class PayDuesDto {
  @ApiPropertyOptional({ example: 25000, description: 'Amount in paise to pay towards outstanding dues' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  amountPaise?: number;
}

export class WalletLedgerQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  limit?: number;
}
