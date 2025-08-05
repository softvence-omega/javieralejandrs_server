import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
@Module({
  imports: [AuthModule, PrismaModule, EventModule, BlogModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
