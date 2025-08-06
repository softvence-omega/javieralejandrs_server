import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma/prisma.service';

export interface ActivityStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface DetailedActivityStats {
  last30Days: ActivityStats;
  allTime: ActivityStats;
}

@Injectable()
export class RecentActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivityStats(): Promise<DetailedActivityStats> {
    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get stats for last 30 days
      const [last30DaysViews, last30DaysLikes, last30DaysComments] =
        await Promise.all([
          this.prisma.view.count({
            where: {
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          }),
          this.prisma.like.count({
            where: {
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          }),
          this.prisma.comment.count({
            where: {
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          }),
        ]);

      // Get all-time stats
      const [allTimeViews, allTimeLikes, allTimeComments] = await Promise.all([
        this.prisma.view.count(),
        this.prisma.like.count(),
        this.prisma.comment.count(),
      ]);

      return {
        last30Days: {
          totalViews: last30DaysViews,
          totalLikes: last30DaysLikes,
          totalComments: last30DaysComments,
        },
        allTime: {
          totalViews: allTimeViews,
          totalLikes: allTimeLikes,
          totalComments: allTimeComments,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get activity stats: ${error.message}`);
    }
  }
}
