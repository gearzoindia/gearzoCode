import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { VehicleType } from '@gearzo/db';

export class ListSubscriptionPlansQueryDto {
  @ApiPropertyOptional({ enum: ['TWO_WHEELER', 'THREE_WHEELER', 'FOUR_WHEELER'] })
  @IsOptional()
  vehicleType?: VehicleType;
}

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'plan_uuid_1' })
  @IsNotEmpty()
  @IsString()
  planId!: string;

  @ApiProperty({ example: 'vehicle_uuid_1' })
  @IsNotEmpty()
  @IsString()
  vehicleId!: string;
}
