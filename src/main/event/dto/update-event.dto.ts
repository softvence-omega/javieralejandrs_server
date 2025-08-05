import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { EventType } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  eventImage?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortOverview?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  overViewImage?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: EventType })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  extraText?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  price?: number;
}
