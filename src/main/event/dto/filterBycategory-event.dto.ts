import { IsOptional, IsString, IsEnum } from 'class-validator';
import { EventType } from '@prisma/client';
// import { PaginationDto } from '@project/common/dto/pagination.dto';

export class FilterByCategoryEventDto {
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
