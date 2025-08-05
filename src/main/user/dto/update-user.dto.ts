import { ApiProperty } from '@nestjs/swagger';
import { userRole } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'The username of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'The profile image URL of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  images?: string;

  @ApiProperty({
    example: 'New York, USA',
    description: 'The location of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example:
      'Software developer passionate about creating amazing applications',
    description: 'The bio of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNo?: string;

  @ApiProperty({
    example: userRole.USER,
    description: 'The role of the user',
    enum: userRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(userRole)
  role?: userRole;

  @ApiProperty({
    example: true,
    description: 'Whether the user is popular (for authors)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;
}
