import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { CreateEventService } from './services/create-event.service';
import { CloudinaryService } from '@project/lib/cloudinary/cloudinary.service';

@Module({
  controllers: [EventController],
  providers: [CreateEventService, CloudinaryService],
})
export class EventModule {}
