import {
  Body,
  Controller,
  Headers,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '@project/lib/prisma/prisma.service';

@Controller('stripe')
export class StripeController {
  private stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('checkout')
  async createCheckoutSession(@Body() dto: CreateStripeDto) {
    return await this.stripeService.createCheckoutSession(dto);
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: Request & { rawBody: Buffer },
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    try {
      const result = await this.stripeService.handleWebhookEvent(
        req.rawBody,
        sig,
      );
      res.json(result);
    } catch (err) {
      console.log(err);
      res
        .status(HttpStatus.BAD_REQUEST)
        .send({ error: (err as Error).message });
    }
  }
}
