import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

import { CreateStripeDto } from './dto/create-stripe.dto';
import { PlanType } from '@prisma/client';
import { PrismaService } from '@project/lib/prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-07-30.basil',
  });

  private readonly logger = new Logger(StripeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createCheckoutSession(dto: CreateStripeDto, hostId: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { type: dto.type },
    });

    if (!plan || !plan.stripePriceId) {
      throw new Error('Plan Or Price id not found');
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
        hostId,
      },
    });

    return {
      id: session.id,
      url: session.url,
    };
  }
  // webhooks
  async handleWebhookEvent(rawBody: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${(err as Error).message}`,
      );
      throw new Error(`Webhook Error: ${(err as Error).message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case 'invoice.payment_failed':
        this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    try {
      const subscriptionId = session.subscription as string;
      const planType = session.metadata?.type;

      if (!planType) return;

      await this.prisma.plan.updateMany({
        where: { type: planType as PlanType },
        data: { isActive: true },
      });

      this.logger.log(
        ` Subscription completed for plan: ${planType}, subscriptionId: ${subscriptionId}`,
      );
    } catch (err) {
      console.log(err);
    }
  }

  private handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.warn(` Payment failed for customer: ${invoice.customer}`);
  }
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
