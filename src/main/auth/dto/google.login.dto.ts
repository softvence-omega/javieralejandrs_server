import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ example: 'asdfsag-fgasdgaaf-gas', description: 'User code' })
  @IsString()
  code: string;
}
