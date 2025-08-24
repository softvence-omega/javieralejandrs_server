import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStripeDto } from './dto/create-stripe.dto';
// import { PlanType } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-07-30.basil',
  });

  constructor(private readonly prisma: PrismaService) {}

  async createCheckoutSession(dto: CreateStripeDto) {
    const plan = await this.prisma.plan.findFirst({
      where: { type: dto.type },
    });

    if (!plan || !plan.stripePriceId) {
      throw new Error('Plan বা Stripe Price ID পাওয়া যায়নি');
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5003';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/checkout/success`, //?session_id={CHECKOUT_SESSION_ID}
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        type: dto.type,
      },
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  // async createCheckoutSession(dto: CreateStripeDto) {
  //   try {
  //     const { successUrl, cancelUrl, type } = dto;

  //     const priceMap = {
  //       [PlanType.STARTER]: process.env.STRIPE_STARTER_PLAN_ID,
  //       [PlanType.GROWTH]: process.env.STRIPE_GROWTH_PLAN_ID,
  //       [PlanType.ENTERPRISE]: process.env.STRIPE_ENTERPRISE_PLAN_ID,
  //     };

  //     const session = await this.stripe.checkout.sessions.create({
  //       mode: 'subscription',
  //       payment_method_types: ['card'],
  //       line_items: [
  //         {
  //           price: priceMap[type],
  //           quantity: 1,
  //         },
  //       ],
  //       success_url: successUrl!,
  //       cancel_url: cancelUrl!,
  //     });

  //     return { url: session.url };
  //   } catch (error) {
  //     return { success: false, message: 'Error creating checkout session', error: error.message };
  //   }
  // }
}
