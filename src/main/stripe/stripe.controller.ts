import { Body, Controller, Post } from '@nestjs/common';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async createCheckoutSession(@Body() dto: CreateStripeDto) {
    return await this.stripeService.createCheckoutSession(dto);
  }

  // @Post('webhook')
  // async handleStripeWebhook(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   @Headers('stripe-signature') sig: string,
  // ) {
  //   const rawBody = (req as any).rawBody;

  //   let event: Stripe.Event;

  //   try {
  //     event = this.stripe.webhooks.constructEvent(
  //       rawBody,
  //       sig,
  //       process.env.STRIPE_WEBHOOK_SECRET,
  //     );
  //   } catch (err) {
  //     console.error('Webhook signature verification failed.', err.message);
  //     return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
  //   }

  //   if (event.type === 'checkout.session.completed') {
  //     const session = event.data.object as Stripe.Checkout.Session;

  //     const userId = session.metadata.userId;
  //     const planId = session.metadata.planId;

  //     // Update user's subscription in DB
  //     await this.prisma.user.update({
  //       where: { id: userId },
  //       data: {
  //         subscriptionPlanId: planId,
  //         subscriptionStatus: 'ACTIVE',
  //       },
  //     });
  //   }

  //   return res.status(HttpStatus.OK).send('✅ Webhook received');
  // }
}
