import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({
    example: 'How to Build a Modern Web Application',
    description: 'The title of the blog post',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'https://example.com/thumbnail.jpg',
    description: 'The thumbnail image URL for the blog',
    required: false,
  })
  @IsOptional()
  @IsString()
  blogThumbnail?: string;

  @ApiProperty({
    example:
      'This blog post covers the fundamentals of building modern web applications...',
    description: 'Short introduction to the blog post',
    required: false,
  })
  @IsOptional()
  @IsString()
  shortInto?: string;

  @ApiProperty({
    example: 'Web Development, Technology, Programming',
    description: 'Themes or categories for the blog post',
    required: false,
  })
  @IsOptional()
  @IsString()
  themes?: string;

  @ApiProperty({
    example: 'Modern UI/UX design principles and entertainment features',
    description: 'Decor and entertainment aspects of the blog',
    required: false,
  })
  @IsOptional()
  @IsString()
  decor_entertainment?: string;

  @ApiProperty({
    example: 'In conclusion, modern web development requires...',
    description: 'Conclusion of the blog post',
    required: false,
  })
  @IsOptional()
  @IsString()
  conclusion?: string;

  @ApiProperty({
    example: '5 min read',
    description: 'Estimated reading time for the blog post',
    required: false,
  })
  @IsOptional()
  @IsString()
  readTime?: string;
}
