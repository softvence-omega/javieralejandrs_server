import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class VerifyResetTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlNmY3...' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'b4c6b4f8-3f4d-4b2a-b4f8-3f4d4b2a4b2a' })
  @IsUUID()
  id: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlNmY3...' })
  @IsString()
  token: string;

  // @ApiProperty({ example: 'b4c6b4f8-3f4d-4b2a-b4f8-3f4d4b2a4b2a' })
  // @IsUUID()
  // id: string;

  @ApiProperty({
    example: 'Qq8@abcd',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must have at least 8 characters, including uppercase, lowercase, number, and special symbol',
    },
  )
  password: string;
}

export class SendOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 4)
  otp: string;
}
