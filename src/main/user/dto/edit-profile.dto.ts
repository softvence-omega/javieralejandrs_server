import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class EditProfileDto {

   @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Profile image file (JPEG, PNG, etc.)',
    required: false,
  })
  @IsOptional()
  images?: any;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Location or address of the user',
    example: 'New York, USA',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Short biography or personal description',
    example: 'full-stack development.',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
}