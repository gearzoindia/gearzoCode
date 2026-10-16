import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole } from '@gearzo/db';

export class QueryAdminsDto {
  @ApiPropertyOptional({ enum: AdminRole })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @ApiPropertyOptional({ description: 'Filter by specific Jurisdiction ID' })
  @IsOptional()
  @IsUUID()
  jurisdictionId?: string;
}

export class InviteAdminDto {
  @ApiProperty({ description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'E.164 phone number', example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: 'Email address', example: 'ops.blr@gearzo.in' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: AdminRole, description: 'Role (must be strictly lower than inviter role)' })
  @IsEnum(AdminRole)
  role!: AdminRole;

  @ApiProperty({ description: 'Jurisdiction ID (must reside within inviter subtree)' })
  @IsUUID()
  jurisdictionId!: string;
}

export class UpdateAdminDto {
  @ApiPropertyOptional({ enum: AdminRole })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jurisdictionId?: string;
}

export class DisableAdminDto {
  @ApiProperty({ description: 'Reason for disabling admin' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
