import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleLoginDto {
  // @ApiProperty({ example: 'asdfsag-fgasdgaaf-gas', description: 'User code' })
  // @IsString()
  // code: string;

  @ApiProperty({ example: 'idToken', description: 'Google ID token' })
  @IsString()
  idToken: string;
}
