import { Module } from '@nestjs/common';
import { PrismaModule } from '../../lib/prisma/prisma.module';
import { RecentActivityController } from './recent-activity.controller';
import { RecentActivityService } from './recent-activity.service';

@Module({
  imports: [PrismaModule],
  controllers: [RecentActivityController],
  providers: [RecentActivityService],
  exports: [RecentActivityService],
})
export class RecentActivityModule {}
