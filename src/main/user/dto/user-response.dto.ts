import { ApiProperty } from '@nestjs/swagger';
import { userRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({
    example: 'uuid-string',
    description: 'The unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'The username of the user',
  })
  userName?: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: userRole.USER,
    description: 'The role of the user',
    enum: userRole,
  })
  role: userRole;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  name?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'The profile image URL of the user',
  })
  images?: string;

  @ApiProperty({
    example: 'New York, USA',
    description: 'The location of the user',
  })
  location?: string;

  @ApiProperty({
    example:
      'Software developer passionate about creating amazing applications',
    description: 'The bio of the user',
  })
  bio?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  phoneNo?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user is popular (for authors)',
  })
  isPopular?: boolean;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'The creation date of the user',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00Z',
    description: 'The last update date of the user',
  })
  updatedAt: Date;

  @ApiProperty({
    example: { blogs: 5, likes: 10, comments: 15 },
    description: 'Count of user activities',
  })
  _count?: {
    blogs: number;
    likes: number;
    comments: number;
    views: number;
  };
}
