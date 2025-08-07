import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecentActivityService } from './recent-activity.service';

@ApiTags('Recent Activity')
@Controller('recent-activity')
export class RecentActivityController {
  constructor(private readonly recentActivityService: RecentActivityService) { }

  @Get('stats')
  @ApiOperation({
    summary: 'Get global activity statistics (last 30 days and all time)',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            last30Days: {
              type: 'object',
              properties: {
                totalViews: { type: 'number' },
                totalLikes: { type: 'number' },
                totalComments: { type: 'number' },
              },
            },
            allTime: {
              type: 'object',
              properties: {
                totalViews: { type: 'number' },
                totalLikes: { type: 'number' },
                totalComments: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async getGlobalActivityStats() {
    const stats = await this.recentActivityService.getActivityStats();
    return {
      success: true,
      message: 'Global activity statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('monthly-views')
  @ApiOperation({
    summary: 'Get monthly view statistics for the last 6 months',
  })
  @ApiQuery({
    name: 'months',
    required: false,
    type: Number,
    description: 'Number of months to get data for (default: 6)',
    example: 6,
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly view statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              year: { type: 'number', example: 2025 },
              month: { type: 'number', example: 2 },
              monthName: { type: 'string', example: 'Feb' },
              viewCount: { type: 'number', example: 100 },
            },
          },
        },
      },
    },
  })
  async getMonthlyViewStats(
    @Query('months', new ParseIntPipe({ optional: true })) months: number = 6,
  ) {
    const stats = await this.recentActivityService.getMonthlyViewStats(months);
    return {
      success: true,
      message: 'Monthly view statistics retrieved successfully',
      data: stats,
    };
  }
}
