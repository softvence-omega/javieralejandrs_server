
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { PlanType } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    // apiVersion: '2024-08-01'
  });

  constructor(private readonly prisma: PrismaService) {}

  async createCheckoutSession( dto: CreateStripeDto) {
    const { successUrl, cancelUrl, type } = dto;
  
    const priceMap = {
      [PlanType.STARTER]: process.env.STRIPE_STARTER_PLAN_ID,
      [PlanType.GROWTH]: process.env.STRIPE_GROWTH_PLAN_ID,
      [PlanType.ENTERPRISE]: process.env.STRIPE_ENTERPRISE_PLAN_ID
    }
      
  const session = await this.stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [
    {
      price: priceMap[type], 
      quantity: 1,
    },
  ],
  success_url: successUrl!, 
  cancel_url: cancelUrl!,
});


    return { url: session.url };
  }
}
