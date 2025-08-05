import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetUser,
  ValidateHostORAuthor,
} from '@project/common/jwt/jwt.decorator';
import { CloudinaryService } from '@project/lib/cloudinary/cloudinary.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventService } from './services/create-event.service';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('----Event')
@Controller('event')
// @ValidateHostORAuthor()
export class EventController {
  constructor(
    private readonly createEventService: CreateEventService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @ValidateHostORAuthor()
  @Post('create-event')
  @ApiOperation({
    summary: 'Create event by host or author',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'eventImage', maxCount: 1 },
      { name: 'overViewImage', maxCount: 10 },
    ]),
  )
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @GetUser('userId') hostId: string,
    @UploadedFiles()
    files: {
      eventImage?: Express.Multer.File[];
      overViewImage?: Express.Multer.File[];
    },
  ) {
    const eventImage = files?.eventImage?.[0];
    const overViewImages = files?.overViewImage || [];

    let eventImageUrl = '';
    const overViewImageUrls: string[] = [];

    if (eventImage) {
      const uploaded = await this.cloudinaryService.uploadImageFromBuffer(
        eventImage.buffer,
        eventImage.originalname,
      );
      eventImageUrl = uploaded.url;
    }

    for (const image of overViewImages) {
      const uploaded = await this.cloudinaryService.uploadImageFromBuffer(
        image.buffer,
        image.originalname,
      );
      overViewImageUrls.push(uploaded.url);
    }

    return this.createEventService.createEvent(
      createEventDto,
      hostId,
      eventImageUrl,
      overViewImageUrls,
    );
  }

  @Get()
  async findAllEvents() {
    return await this.createEventService.findAllEvents();
  }

  @Get(':id')
  async findEventById(@Param('id') id: string) {
    return await this.createEventService.findEventById(id);
  }



  @ValidateHostORAuthor()
  @Post(':id/update-event')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'eventImage', maxCount: 1 },
      { name: 'overViewImage', maxCount: 10 },
    ]),
  )
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles()
    files: {
      eventImage?: Express.Multer.File[];
      overViewImage?: Express.Multer.File[];
    },
  ) {
    // Event Image Upload
    const eventImage = files?.eventImage?.[0];
    const overViewImages = files?.overViewImage || [];

    let eventImageUrl = '';
    const overViewImageUrls: string[] = [];

    if (eventImage) {
      const uploaded = await this.cloudinaryService.uploadImageFromBuffer(
        eventImage.buffer,
        eventImage.originalname,
      );
      eventImageUrl = uploaded.url;
    }

    for (const image of overViewImages) {
      const uploaded = await this.cloudinaryService.uploadImageFromBuffer(
        image.buffer,
        image.originalname,
      );
      overViewImageUrls.push(uploaded.url);
    }

    return await this.createEventService.updateEvent(id, updateEventDto, eventImageUrl, overViewImageUrls);
  }

  @Delete(':id')
  async deleteEvent(@Param('id') id: string) {
    return await this.createEventService.deleteEvent(id);
  }

}
