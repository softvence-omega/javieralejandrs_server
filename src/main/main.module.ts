import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BlogController } from './blog/blog.controller';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [AuthModule, PrismaModule, BlogModule],
  controllers: [BlogController],
  providers: [],
})
export class MainModule {}
