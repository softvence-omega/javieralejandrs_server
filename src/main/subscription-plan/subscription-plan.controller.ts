import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ValidateAdmin } from '@project/common/jwt/jwt.decorator';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { SubscriptionPlanService } from './subscription-plan.service';

@Controller('subscription-plan')
export class SubscriptionPlanController {
  constructor(
    private readonly subscriptionPlanService: SubscriptionPlanService,
  ) {}

  @ValidateAdmin()
  @Post('create-plan')
  async createSubscription(@Body() dto: CreateSubscriptionPlanDto) {
    return await this.subscriptionPlanService.createSubscription(dto);
  }

  @Get()
  async findAll() {
    return await this.subscriptionPlanService.getAllPlans();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return await this.subscriptionPlanService.updatePlan(id, dto);
  }

  @Delete(':id')
  async removePlan(@Param('id') id: string) {
    return await this.subscriptionPlanService.removePlan(id);
  }
}
