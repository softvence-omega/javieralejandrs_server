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
  constructor(private readonly prisma: PrismaService) { }

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

  async getUserActivityStats(userId: string): Promise<DetailedActivityStats> {
    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get user's blog IDs
      const userBlogs = await this.prisma.blog.findMany({
        where: { authorId: userId },
        select: { id: true },
      });

      const userBlogIds = userBlogs.map((blog) => blog.id);

      if (userBlogIds.length === 0) {
        return {
          last30Days: { totalViews: 0, totalLikes: 0, totalComments: 0 },
          allTime: { totalViews: 0, totalLikes: 0, totalComments: 0 },
        };
      }

      // Get stats for user's blogs in last 30 days
      const [last30DaysViews, last30DaysLikes, last30DaysComments] =
        await Promise.all([
          this.prisma.view.count({
            where: {
              blogId: { in: userBlogIds },
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
          this.prisma.like.count({
            where: {
              blogId: { in: userBlogIds },
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
          this.prisma.comment.count({
            where: {
              blogId: { in: userBlogIds },
              createdAt: { gte: thirtyDaysAgo },
            },
          }),
        ]);

      // Get all-time stats for user's blogs
      const [allTimeViews, allTimeLikes, allTimeComments] = await Promise.all([
        this.prisma.view.count({
          where: { blogId: { in: userBlogIds } },
        }),
        this.prisma.like.count({
          where: { blogId: { in: userBlogIds } },
        }),
        this.prisma.comment.count({
          where: { blogId: { in: userBlogIds } },
        }),
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
      throw new Error(`Failed to get user activity stats: ${error.message}`);
    }
  }

  async getDailyActivityTrend(days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get daily aggregated data
      const dailyStats = await this.prisma.$queryRaw<any[]>`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as views
        FROM "View" 
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
      `;

      return dailyStats;
    } catch (error) {
      throw new Error(`Failed to get daily activity trend: ${error.message}`);
    }
  }

  async getMonthlyViewStats(months: number = 6): Promise<any[]> {
    try {
      // Calculate start date (6 months ago)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      startDate.setDate(1); // Start from the first day of the month
      startDate.setHours(0, 0, 0, 0);

      // Get monthly view data only for months that have data
      const monthlyStats = await this.prisma.$queryRaw<any[]>`
        SELECT 
          EXTRACT(YEAR FROM "createdAt") as year,
          EXTRACT(MONTH FROM "createdAt") as month,
          COUNT(*) as view_count
        FROM "View" 
        WHERE "createdAt" >= ${startDate}
        GROUP BY 
          EXTRACT(YEAR FROM "createdAt"), 
          EXTRACT(MONTH FROM "createdAt")
        ORDER BY year, month
      `;

      // Generate all months for the last 6 months
      const allMonths = [];
      const currentDate = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date(currentDate);
        monthDate.setMonth(currentDate.getMonth() - i);

        const year = monthDate.getFullYear();
        const month = monthDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
        const monthName = monthDate.toLocaleDateString('en-US', {
          month: 'short',
        });

        // Find if this month has data
        const monthData = monthlyStats.find(
          (stat) => Number(stat.year) === year && Number(stat.month) === month,
        );

        allMonths.push({
          year: year,
          month: month,
          monthName: monthName,
          viewCount: monthData ? Number(monthData.view_count) : 0,
        });
      }

      return allMonths;
    } catch (error) {
      throw new Error(`Failed to get monthly view stats: ${error.message}`);
    }
  }
}
