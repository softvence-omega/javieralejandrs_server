import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Old password',
    example: '11111111',
  })
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: 'New password',
    example: '11111111',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
