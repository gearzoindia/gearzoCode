import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectOfferDto {
  @ApiPropertyOptional({ example: 'Location is too far', description: 'Optional reason for rejecting offer' })
  @IsOptional()
  @IsString()
  reason?: string;
}
