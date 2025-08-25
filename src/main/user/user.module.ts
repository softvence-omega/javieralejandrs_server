import { Module } from '@nestjs/common';
import { CloudinaryService } from '@project/lib/cloudinary/cloudinary.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BrandModule } from './brand/brand.module';
import { PrismaModule } from '@project/lib/prisma/prisma.module';

@Module({
  imports: [PrismaModule, BrandModule],
  controllers: [UserController],
  providers: [UserService, CloudinaryService],
  exports: [UserService],
})
export class UserModule {}
