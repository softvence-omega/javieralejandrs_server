import { Injectable } from '@nestjs/common';
import { PrismaService } from '@project/lib/prisma/prisma.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { successResponse } from '@project/common/utils/response.util';

@Injectable()
export class CreateEventService {
    constructor(private readonly prisma: PrismaService) { }
    async createEvent(dto: CreateEventDto, hostId: string) {
        const result = await this.prisma.event.create({
            data: dto
        })

        return successResponse(result, "Event Created Successfull!!")
    }
}
