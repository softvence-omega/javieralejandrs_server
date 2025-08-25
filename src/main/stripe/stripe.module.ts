import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaModule } from '@project/lib/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
