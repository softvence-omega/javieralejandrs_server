import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [AuthModule, PrismaModule,EventModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
