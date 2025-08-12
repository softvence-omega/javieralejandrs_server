import { Module } from '@nestjs/common';
import { NewslatterService } from './newslatter.service';
import { NewslatterController } from './newslatter.controller';

@Module({
  controllers: [NewslatterController],
  providers: [NewslatterService],
})
export class NewslatterModule {}
