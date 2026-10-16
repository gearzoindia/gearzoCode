import { IsOptional, IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class QueryApprovalsDto {
  @ApiPropertyOptional({ enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' })
  @IsOptional()
  @IsString()
  status?: string = 'pending';
}

export class ApproveRequestDto {
  @ApiPropertyOptional({ description: 'Optional approval decision note' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class RejectRequestDto {
  @ApiProperty({ description: 'Rejection reason note' })
  @IsString()
  @IsNotEmpty()
  note!: string;
}
