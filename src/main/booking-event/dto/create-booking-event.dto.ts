import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingEventDto {
  @ApiProperty({
    example: '53a53178-042d-4288-8646-f807c0debeb8',
    description: 'Event ID to book',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  // @ApiProperty({ example: '73367c1b-da0f-4b1b-934b-b6a1165433e2', description: 'Event ID to book' })
  // @IsString()
  // @IsNotEmpty()
  // userId: string;
}
