import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePaymentOrderDto {
  @ApiProperty({ example: 'bk_sample_101' })
  @IsNotEmpty()
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: 114882, description: 'Amount in paise' })
  @IsInt()
  @Min(100)
  amountPaise!: number;

  @ApiProperty({ example: 'INR' })
  @IsNotEmpty()
  @IsString()
  currency!: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 'order_NxABC123456' })
  @IsNotEmpty()
  @IsString()
  razorpayOrderId!: string;

  @ApiProperty({ example: 'pay_NxXYZ789101' })
  @IsNotEmpty()
  @IsString()
  razorpayPaymentId!: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6...' })
  @IsNotEmpty()
  @IsString()
  razorpaySignature!: string;

  @ApiProperty({ example: 'bk_sample_101' })
  @IsNotEmpty()
  @IsString()
  bookingId!: string;
}
