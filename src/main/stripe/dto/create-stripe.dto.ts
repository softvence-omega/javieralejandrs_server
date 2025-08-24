import { ApiProperty } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateStripeDto {
  @ApiProperty({ enum: PlanType })
  @IsEnum(PlanType)
  type: PlanType;

  // @ApiProperty({ example: 'http://localhost:3000/stripe/payment-success' })
  // @IsString()
  // @IsNotEmpty()
  // successUrl: string;

  // @ApiProperty({ example: 'http://localhost:3000/stripe/payment-cancel' })
  // @IsString()
  // @IsNotEmpty()
  // cancelUrl: string;
}
