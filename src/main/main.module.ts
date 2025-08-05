import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
@Module({
  imports: [AuthModule, PrismaModule, EventModule, BlogModule, UserModule],
  controllers: [UserController],
  providers: [],
})
export class MainModule {}
