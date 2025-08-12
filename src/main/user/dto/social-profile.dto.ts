import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class SocialProfileDto {
  @ApiProperty({ example: 'https://wa.me/880123456789' })
  @IsUrl()
  @IsNotEmpty()
  whatsapp: string;
}
