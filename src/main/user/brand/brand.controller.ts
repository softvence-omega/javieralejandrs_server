import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser, ValidateAuth } from '@project/common/jwt/jwt.decorator';
import { CloudinaryService } from '@project/lib/cloudinary/cloudinary.service';

@Controller('brand/me')
export class BrandController {
  constructor(
    private readonly brandService: BrandService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('update')
  @ApiBearerAuth()
  @ValidateAuth()
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  async createOrUpdateCompany(
    @GetUser('userId') userId: string,
    @Body() dto: CreateBrandDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let brandUrl: string | undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(
        file.buffer,
        file.originalname,
        'brand-logos',
      );
      brandUrl = uploadResult.secure_url;
    }
    return await this.brandService.createOrUpdateBrand(userId, {
      ...dto,
      ...(brandUrl && { logo: brandUrl }),
    });
  }
}
