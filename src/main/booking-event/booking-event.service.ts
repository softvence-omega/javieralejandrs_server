import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingEventDto } from './dto/create-booking-event.dto';
import { PrismaService } from '@project/lib/prisma/prisma.service';
import Stripe from 'stripe';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingEventService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      // apiVersion: '2024-06-20',
    });
  }

  async createCheckoutSession(userId: string, dto: CreateBookingEventDto) {
    const { eventId } = dto;

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new BadRequestException('Event not found');

    // 1. Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: event.shortDescription },
            unit_amount: event.price * 100, // cents
          },
          quantity: 1,
        },
      ],
      metadata: { eventId, userId },
      success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
    });
    const booking = await this.prisma.booking.create({
      data: {
        eventId,
        userId,
        // checkoutSessionId: session.id, // save checkoutSessionId instead of paymentIntentId
        status: BookingStatus.PENDING,
      },
    });

    return { url: session.url, booking };
  }
  async createBooking(userId: string, dto: CreateBookingEventDto) {
    const { eventId } = dto;
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new BadRequestException('Event not found');

    // Create Stripe Payment Intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: event.price * 100,
      currency: 'usd',
      metadata: { eventId, userId },
    });

    console.log(paymentIntent, 'paymentIntent');
    // Save Booking in DB
    const booking = await this.prisma.booking.create({
      data: {
        eventId,
        userId,
        paymentIntentId: paymentIntent.id,
        status: BookingStatus.PENDING,
      },
    });

    return { clientSecret: paymentIntent.client_secret, booking };
  }

  async confirmBooking(paymentId: string) {
    return this.prisma.booking.updateMany({
      where: { paymentIntentId: paymentId },
      data: { status: BookingStatus.CONFIRMED },
    });
  }

  // Handle Stripe Webhook
  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);
        await this.confirmBooking(paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent failed: ${failedIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  async findAll() {
    return this.prisma.booking.findMany();
  }
}
