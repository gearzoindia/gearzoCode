import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppType, Platform } from '@gearzo/db';

export class CreateAppVersionDto {
  @ApiProperty({ enum: AppType, example: AppType.CUSTOMER_APP })
  @IsEnum(AppType)
  app!: AppType;

  @ApiProperty({ enum: Platform, example: Platform.ANDROID })
  @IsEnum(Platform)
  platform!: Platform;

  @ApiProperty({ description: 'Minimum supported semver version', example: '1.2.0' })
  @IsString()
  @IsNotEmpty()
  minSupportedVersion!: string;

  @ApiProperty({ description: 'Latest released semver version', example: '1.4.2' })
  @IsString()
  @IsNotEmpty()
  latestVersion!: string;

  @ApiPropertyOptional({ description: 'Update prompt message shown to users' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateAppVersionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  minSupportedVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  latestVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}
