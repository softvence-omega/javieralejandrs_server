import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { NewslatterService } from './newslatter.service';
import { CreateNewslatterDto } from './dto/create-newslatter.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ValidateAdmin } from '@project/common/jwt/jwt.decorator';

@Controller('newslatter')
export class NewslatterController {
  constructor(private readonly newslatterService: NewslatterService) {}

  @Post('create')
  async create(@Body() dto: CreateNewslatterDto) {
    return await this.newslatterService.create(dto);
  }

  @ApiBearerAuth()
  @ValidateAdmin()
  @Get()
  async findAll() {
    return await this.newslatterService.findAll();
  }

  @ApiBearerAuth()
  @ValidateAdmin()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.newslatterService.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateNewslatterDto: UpdateNewslatterDto,
  // ) {
  //   return this.newslatterService.update(+id, updateNewslatterDto);
  // }

  @ApiBearerAuth()
  @ValidateAdmin()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.newslatterService.remove(id);
  }
}
