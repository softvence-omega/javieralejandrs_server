import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { PrismaService } from '@project/lib/prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}
  async createOrUpdateBrand(userId: string, dto: CreateBrandDto) {
    return await this.prisma.brand.upsert({
      where: { userId },
      update: {
        name: dto.brandName ?? '',
        logo: dto.logo,
      },
      create: {
        userId,
        name: dto.brandName ?? '',
        logo: dto.logo,
      },
    });
  }
}
