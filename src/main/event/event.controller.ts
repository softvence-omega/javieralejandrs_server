import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventService } from './services/create-event.service';
import { GetUser } from '@project/common/jwt/jwt.decorator';
import { startTimer } from 'winston';

@Controller('event')
export class EventController {
  constructor(private readonly createEventService: CreateEventService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto,@GetUser('hostId')hostid:string

  ) {
    return this.createEventService.createEvent(createEventDto,hostId);
  }

  // @Get()
  // findAll() {
  //   return this.eventService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.eventService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
  //   return this.eventService.update(+id, updateEventDto);
  // }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.eventService.remove(+id);
  // }
}
