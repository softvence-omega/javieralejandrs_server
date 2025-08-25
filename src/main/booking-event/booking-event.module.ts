import { Module } from '@nestjs/common';
import { BookingEventService } from './booking-event.service';
import { BookingEventController } from './booking-event.controller';

@Module({
  controllers: [BookingEventController],
  providers: [BookingEventService],
})
export class BookingEventModule {}
