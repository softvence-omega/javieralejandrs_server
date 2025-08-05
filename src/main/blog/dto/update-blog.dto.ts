import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBlogDto {
  @ApiProperty({
    example: 'Updated Blog Title',
    description: 'The updated title of the blog post',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'https://example.com/new-thumbnail.jpg',
    description: 'The updated thumbnail image URL for the blog',
    required: false,
  })
  @IsOptional()
  @IsString()
  blogThumbnail?: string;

  @ApiProperty({
    example: 'Updated short introduction...',
    description: 'Updated short introduction to the blog post',
    required: false,
  })
  @IsOptional()
  @IsString()
  shortInto?: string;

  @ApiProperty({
    example: 'Updated themes',
    description: 'Updated themes or categories for the blog post',
    required: false,
  })
  @IsOptional()
  @IsString()
  themes?: string;

  @ApiProperty({
    example: 'Updated decor and entertainment aspects',
    description: 'Updated decor and entertainment aspects of the blog',
    required: false,
  })
  @IsOptional()
  @IsString()
  decor_entertainment?: string;

  @ApiProperty({
    example: 'Updated conclusion...',
    description: 'Updated conclusion of the blog post',
    required: false,
  })
  @IsOptional()
  @IsString()
  conclusion?: string;

  @ApiProperty({
    example: '7 min read',
    description: 'Updated estimated reading time for the blog post',
    required: false,
  })
  @IsOptional()
  @IsString()
  readTime?: string;
}
