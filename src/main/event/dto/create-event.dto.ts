import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsArray, IsInt } from 'class-validator';
import { EventType } from '@prisma/client'; // Adjust if your enum is in a different path

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  shortName: string;

  @ApiProperty()
  @IsString()
  shortDescription: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  eventImage: any;

  @ApiProperty()
  @IsString()
  shortOverview: string;

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  overViewImage: any[];

  @ApiProperty({ type: [String] })
  @IsArray()
  tags: string[];

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({ type: [String] })
  @IsArray()
  extraText: string[];

  @ApiProperty()
  @IsString()
  location: string;

  @ApiProperty()
  @IsInt()
  price: number;

  @ApiProperty()
  @IsString()
  hostId: string;
}
