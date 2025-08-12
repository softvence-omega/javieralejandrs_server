import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CloudinaryService } from '@project/lib/cloudinary/cloudinary.service';
import { UtilsService } from '@project/lib/utils/utils.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, CloudinaryService],
  exports: [UserService],
})
export class UserModule {}
