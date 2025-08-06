import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSubscriptionPlanDto } from './create-subscription-plan.dto';
import { PlanType } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSubscriptionPlanDto extends PartialType(CreateSubscriptionPlanDto) {
   @ApiProperty({ enum: PlanType })
  @IsEnum(PlanType)
  @IsOptional()
  type?: PlanType;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  features?: string[];
}
