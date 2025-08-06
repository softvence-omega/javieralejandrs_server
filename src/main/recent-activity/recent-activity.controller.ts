import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecentActivityService } from './recent-activity.service';

@ApiTags('Recent Activity')
@Controller('recent-activity')
export class RecentActivityController {
  constructor(private readonly recentActivityService: RecentActivityService) {}

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
}
