import { ApiProperty } from '@nestjs/swagger';

export class ActivityStatsDto {
  @ApiProperty({
    description: 'Total number of views',
    example: 1500,
  })
  totalViews: number;

  @ApiProperty({
    description: 'Total number of likes',
    example: 245,
  })
  totalLikes: number;

  @ApiProperty({
    description: 'Total number of comments',
    example: 78,
  })
  totalComments: number;
}

export class DetailedActivityStatsDto {
  @ApiProperty({
    description: 'Activity statistics for the last 30 days',
    type: ActivityStatsDto,
  })
  last30Days: ActivityStatsDto;

  @ApiProperty({
    description: 'All-time activity statistics',
    type: ActivityStatsDto,
  })
  allTime: ActivityStatsDto;
}

export class DailyActivityDto {
  @ApiProperty({
    description: 'Date of the activity',
    example: '2025-08-07',
  })
  date: string;

  @ApiProperty({
    description: 'Number of views on this date',
    example: 50,
  })
  views: number;

  @ApiProperty({
    description: 'Number of likes on this date',
    example: 12,
  })
  likes: number;

  @ApiProperty({
    description: 'Number of comments on this date',
    example: 8,
  })
  comments: number;
}

export class MonthlyViewStatsDto {
  @ApiProperty({
    description: 'Year of the data',
    example: 2025,
  })
  year: number;

  @ApiProperty({
    description: 'Month number (1-12)',
    example: 2,
  })
  month: number;

  @ApiProperty({
    description: 'Month name abbreviation',
    example: 'Feb',
  })
  monthName: string;

  @ApiProperty({
    description: 'View count for this month',
    example: 100,
  })
  viewCount: number;
}
