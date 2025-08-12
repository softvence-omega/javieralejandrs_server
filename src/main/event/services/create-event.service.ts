import { Injectable, NotFoundException } from '@nestjs/common';
import { successResponse } from '@project/common/utils/response.util';
import { PrismaService } from '@project/lib/prisma/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { FilterEventDto } from '../dto/filter-event.dto';
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
      include: {
        host: true,
      },
    });

    return successResponse(event, 'Event created successfully!');
  }

  async findAllEvents(query: FilterEventDto) {
    const { eventType, location, rating, minPrice, maxPrice, search } = query;
    const events = await this.prisma.event.findMany({
      where: {
        AND: [
          location
            ? {
                location: {
                  contains: location,
                  mode: 'insensitive',
                },
              }
            : {},
          eventType ? { eventType } : {},
          search
            ? {
                OR: [
                  {
                    shortName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    tags: {
                      has: search,
                    },
                  },
                ],
              }
            : {},
          minPrice || maxPrice
            ? {
                price: {
                  gte: minPrice ? Number(minPrice) : undefined,
                  lte: maxPrice ? Number(maxPrice) : undefined,
                },
              }
            : {},
          rating
            ? {
                rating: Number(rating),
              }
            : {},
        ],
      },
      orderBy: {
        rating: 'desc',
      },
      //   include: {
      //     host: true,
      //   },
    });
    return successResponse(events, 'Events fetched successfully!');
  }

  async findEventById(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event does not exist');
    }
    return successResponse(event, 'Event fetched successfully!');
  }

  async updateEvent(
    id: string,
    dto: UpdateEventDto,
    eventImageUrl: string,
    overViewImageUrls?: string[],
  ): Promise<any> {
    const existingEvent = await this.prisma.event.findUnique({ where: { id } });
    // console.log(dto, 'dto');

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
    // console.log(updated, 'updated');

    return successResponse(updated, 'Event updated successfully!');
  }

  async deleteEvent(id: string) {
    const event = await this.prisma.event.delete({ where: { id } });
    return successResponse(event, 'Event deleted successfully!');
  }
}
