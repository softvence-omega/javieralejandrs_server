import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { CreateEventService } from './services/create-event.service';

@Module({
  controllers: [EventController],
  providers: [CreateEventService],
})
export class EventModule {}
