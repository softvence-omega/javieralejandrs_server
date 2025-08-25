import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({
    example: 'Government Titumir College',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'Bir Uttam AK Khandakar Rd, Dhaka 1213',
  })
  @IsString()
  @MinLength(5)
  address: string;
}
