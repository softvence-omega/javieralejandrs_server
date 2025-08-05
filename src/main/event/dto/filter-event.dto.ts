import { IsOptional, IsString, IsEnum, IsNumberString } from 'class-validator';
import { EventType } from '@prisma/client';

export class FilterEventDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsNumberString()
  rating?: string;

  @IsOptional()
  @IsString()
  sort?: string; // "price", "rating", "createdAt"
  
}
