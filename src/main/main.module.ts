import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { RecentActivityController } from './recent-activity/recent-activity.controller';
import { RecentActivityModule } from './recent-activity/recent-activity.module';
@Module({
  imports: [
    AuthModule,
    PrismaModule,
    EventModule,
    BlogModule,
    UserModule,
    RecentActivityModule,
  ],
  controllers: [UserController, RecentActivityController],
  providers: [],
})
export class MainModule {}
