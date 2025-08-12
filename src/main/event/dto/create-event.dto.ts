import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  shortName: string;

  @ApiProperty()
  @IsString()
  shortDescription: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  eventImage?: any;

  @ApiProperty()
  @IsString()
  shortOverview: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  overViewImage?: any[];

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  tags: string[];

  @ApiProperty()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  extraText: string[];

  @ApiProperty()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  price: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value, 10))
  rating: number;
}
