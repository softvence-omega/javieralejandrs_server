import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateNewslatterDto {
  @ApiProperty({
    example: 'john@gmail.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;
}
