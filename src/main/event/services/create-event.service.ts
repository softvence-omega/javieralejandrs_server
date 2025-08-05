import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@project/lib/prisma/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { successResponse } from '@project/common/utils/response.util';
import { UpdateEventDto } from '../dto/update-event.dto';

@Injectable()
export class CreateEventService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(
    dto: CreateEventDto,
    hostId: string,
    eventImageUrl: string,
    overViewImageUrls?: string[],
  ): Promise<any> {
    const host = await this.prisma.user.findUnique({
      where: { id: hostId },
    });

    if (!host) {
      throw new NotFoundException('Host does not exist');
    }

    const event = await this.prisma.event.create({
      data: {
        ...dto,
        hostId,
        eventImage: eventImageUrl,
        overViewImage: overViewImageUrls ?? [],
      },
      //   include: {
      //     host: true,
      //   },
    });

    return successResponse(event, 'Event created successfully!');
  }

  async findAllEvents() {
    const events = await this.prisma.event.findMany();
    return successResponse(events, 'Events fetched successfully!');
  }

  async findEventById(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event does not exist');
    }
    return successResponse(event, 'Event fetched successfully!');
  }

  //   async updateEvent(id: string, dto: UpdateEventDto) {
  //     const event = await this.prisma.event.update({
  //       where: { id },
  //       data: dto,
  //     });
  //     return successResponse(event, 'Event updated successfully!');
  //   }

  async updateEvent(
    id: string,
    dto: UpdateEventDto,
    eventImageUrl: string,
    overViewImageUrls?: string[],
  ): Promise<any> {
    const existingEvent = await this.prisma.event.findUnique({ where: { id } });
    console.log(dto, 'dto');

    if (!existingEvent) {
      throw new Error('Event not found!');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        eventImage: eventImageUrl,
        overViewImage: overViewImageUrls ?? [],
      },
    });
    console.log(updated, 'updated');

    return successResponse(updated, 'Event updated successfully!');
  }

  async deleteEvent(id: string) {
    const event = await this.prisma.event.delete({ where: { id } });
    return successResponse(event, 'Event deleted successfully!');
  }
}
