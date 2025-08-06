import { ApiProperty } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';

// export enum PlanType {
//   STARTER = 'STARTER',
//   BUSINESS = 'BUSINESS',
//   PREMIUM = 'PREMIUM',
// }
export class CreateSubscriptionPlanDto {
  @ApiProperty({ enum: PlanType })
  @IsEnum(PlanType)
  type: PlanType;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  duration: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  feature: string[];
}
