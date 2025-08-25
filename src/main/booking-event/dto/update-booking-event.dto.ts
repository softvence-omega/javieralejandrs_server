import { PartialType } from '@nestjs/swagger';
import { CreateBookingEventDto } from './create-booking-event.dto';

export class UpdateBookingEventDto extends PartialType(CreateBookingEventDto) {}
