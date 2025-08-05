import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BlogController } from './blog/blog.controller';
import { BlogModule } from './blog/blog.module';
import { BlogService } from './blog/blog.service';

@Module({
  imports: [AuthModule, PrismaModule, BlogModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class MainModule {}
