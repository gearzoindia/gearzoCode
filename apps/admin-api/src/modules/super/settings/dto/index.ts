import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetSystemLimitDto {
  @ApiProperty({ description: 'Limit key identifier', example: 'session.customer.maxSessions' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ description: 'Value payload (numeric or structured JSON limit)' })
  value!: any;

  @ApiPropertyOptional({ description: 'Reason for changing limit' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SetBookingRulesDto {
  @ApiProperty({ description: 'Booking operational rules (lead times, max slots, grace period)' })
  @IsObject()
  rules!: Record<string, any>;
}
