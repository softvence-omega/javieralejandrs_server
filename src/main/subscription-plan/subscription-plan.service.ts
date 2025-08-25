import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import Stripe from 'stripe';
import { successResponse } from '@project/common/utils/response.util';
import { PrismaService } from '@project/lib/prisma/prisma.service';

@Injectable()
export class SubscriptionPlanService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      // apiVersion: '2023-08-16'
    });
  }
  async createSubscription(dto: CreateSubscriptionPlanDto) {
    const isExist = await this.prisma.plan.findFirst({
      where: { type: dto.type },
    });
    if (isExist) {
      throw new BadRequestException('Plan already exist');
    }
    // console.log(await this.stripe.products.create)

    const stripeProduct = await this.stripe.products.create({
      name: dto.type,
      description: `${dto.type} subscription plan`,
      metadata: {
        planType: dto.type,
        features: dto.features?.join(',') || '',
      },
    });
    // console.log(stripeProduct, 'stripeProduct');

    const stripePrice = await this.stripe.prices.create({
      currency: 'usd',
      unit_amount: Number(dto.price) * 100,
      product: stripeProduct.id,
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      metadata: {
        planType: dto.type,
      },
    });

    // console.log(stripePrice, 'stripePrice');

    const plan = await this.prisma.plan.create({
      data: {
        type: dto.type,
        description: dto.description,
        price: dto.price,
        duration: dto.duration,
        features: dto.features,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      },
    });
    return successResponse(plan, 'Plan created successfully!');
  }

  async getAllPlans() {
    const plans = await this.prisma.plan.findMany();
    return successResponse(plans, 'Plans fetched successfully!');
  }

  async updatePlan(id: string, dto: UpdateSubscriptionPlanDto) {
    console.log(dto, 'dto');
    const plan = await this.prisma.plan.update({
      where: { id },
      data: { ...dto },
    });
    console.log(plan, 'plan');
    return successResponse(plan, 'Plan updated successfully!');
  }

  async removePlan(id: string) {
    const plan = await this.prisma.plan.delete({ where: { id } });
    return successResponse(plan, 'Plan deleted successfully!');
  }
}
