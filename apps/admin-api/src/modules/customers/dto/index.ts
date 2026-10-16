import { IsOptional, IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCustomersDto {
  @ApiPropertyOptional({ description: 'Search by name, booking code, or last 4 digits of phone' })
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

export class BlockCustomerDto {
  @ApiProperty({ description: 'Reason for blocking or unblocking the customer' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
