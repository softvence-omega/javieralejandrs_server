import { ApiProperty } from '@nestjs/swagger';

export class FirebaseLoginDto {
  @ApiProperty({
    description: 'Firebase ID Token from client after Google login',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlNmY3...'
  })
  idToken: string;
}
