import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  Req,
  Res,
  Headers,
  HttpStatus,
} from '@nestjs/common';
import { BookingEventService } from './booking-event.service';
import { CreateBookingEventDto } from './dto/create-booking-event.dto';
// import { UpdateBookingEventDto } from './dto/update-booking-event.dto';
import {
  GetUser,
  ValidateHostORAuthor,
  ValidateUser,
} from '@project/common/jwt/jwt.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';

@Controller('booking')
export class BookingEventController {
  constructor(private readonly bookingEventService: BookingEventService) {}

  @ApiBearerAuth()
  @ValidateUser()
  @Post('checkout')
  checkout(
    @Body() dto: CreateBookingEventDto,
    @GetUser('userId') userId: string,
  ) {
    return this.bookingEventService.createCheckoutSession(userId, dto);
  }

  @ApiBearerAuth()
  @ValidateUser()
  @Post('booking-event')
  create(
    @Body() dto: CreateBookingEventDto,
    @GetUser('userId') userId: string,
  ) {
    if (!userId) throw new BadRequestException('User not found');
    return this.bookingEventService.createBooking(userId, dto);
  }

  // Confirm booking by paymentIntentId
  @Post('confirm/:paymentId')
  async confirm(@Param('paymentId') paymentId: string) {
    const result = await this.bookingEventService.confirmBooking(paymentId);
    if (result.count === 0) {
      throw new BadRequestException('Booking not found or already confirmed');
    }
    return { success: true, message: 'Booking confirmed successfully' };
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request & { rawBody: Buffer },
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      await this.bookingEventService.handleWebhook(req.rawBody, signature);
      return res.status(HttpStatus.OK).json({ received: true });
    } catch (error: any) {
      console.error(error);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(`Webhook Error: ${error.message}`);
    }
  }

  // Get all bookings (for admin or testing)
  @Get()
  @ApiBearerAuth()
  @ValidateHostORAuthor()
  async findAll() {
    return this.bookingEventService.findAll();
  }
}
