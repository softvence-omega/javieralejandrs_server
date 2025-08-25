import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { SubscriptionPlanModule } from './subscription-plan/subscription-plan.module';
import { StripeModule } from './stripe/stripe.module';
import { NewslatterModule } from './newslatter/newslatter.module';
import { LocationModule } from './location/location.module';
import { BookingEventModule } from './booking-event/booking-event.module';
import { PrismaModule } from '@project/lib/prisma/prisma.module';
@Module({
  imports: [
    AuthModule,
    PrismaModule,
    EventModule,
    BlogModule,
    UserModule,
    SubscriptionPlanModule,
    StripeModule,
    NewslatterModule,
    LocationModule,
    BookingEventModule,
  ],
  controllers: [UserController],
  providers: [],
})
export class MainModule {}
