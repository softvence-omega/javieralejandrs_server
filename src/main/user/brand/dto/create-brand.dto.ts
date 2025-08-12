import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Link & Party' })
  @IsString()
  @IsOptional()
  brandName?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile image file (JPEG, PNG, etc.)',
    required: false,
  })
  @IsOptional()
  logo?: any;
}
