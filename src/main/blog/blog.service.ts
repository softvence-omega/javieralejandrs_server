import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '@project/lib/prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async createBlog(createBlogDto: CreateBlogDto, authorId: string) {
    try {
      const blog = await this.prisma.blog.create({
        data: {
          title: createBlogDto.title,
          blogThumbnail: createBlogDto.blogThumbnail,
          shortInto: createBlogDto.shortInto,
          themes: createBlogDto.themes,
          decor_entertainment: createBlogDto.decor_entertainment,
          conclusion: createBlogDto.conclusion,
          readTime: createBlogDto.readTime,
          authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              userName: true,
              name: true,
              images: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Blog created successfully',
        data: blog,
      };
    } catch (error) {
      throw new Error(`Failed to create blog: ${error.message}`);
    }
  }

  async getAllBlogs(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [blogs, total] = await Promise.all([
        this.prisma.blog.findMany({
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: {
              select: {
                id: true,
                userName: true,
                name: true,
                images: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                views: true,
              },
            },
          },
        }),
        this.prisma.blog.count(),
      ]);

      return {
        success: true,
        message: 'Blogs retrieved successfully',
        data: {
          blogs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get blogs: ${error.message}`);
    }
  }

  async getBlogById(id: string, userId?: string) {
    try {
      const blog = await this.prisma.blog.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              userName: true,
              name: true,
              images: true,
            },
          },
          likes: {
            where: userId ? { userId } : undefined,
            select: { id: true },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      });

      if (!blog) {
        throw new NotFoundException('Blog not found');
      }

      // Increment view count
      if (userId) {
        await this.incrementViewCount(id, userId);
      }

      return {
        success: true,
        message: 'Blog retrieved successfully',
        data: {
          ...blog,
          isLiked: blog.likes.length > 0,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to get blog: ${error.message}`);
    }
  }

  async updateBlog(id: string, updateBlogDto: UpdateBlogDto, userId: string) {
    try {
      // Check if blog exists and user is the author
      const existingBlog = await this.prisma.blog.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!existingBlog) {
        throw new NotFoundException('Blog not found');
      }

      if (existingBlog.authorId !== userId) {
        throw new ForbiddenException('You can only update your own blogs');
      }

      const updatedBlog = await this.prisma.blog.update({
        where: { id },
        data: updateBlogDto,
        include: {
          author: {
            select: {
              id: true,
              userName: true,
              name: true,
              images: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'Blog updated successfully',
        data: updatedBlog,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error(`Failed to update blog: ${error.message}`);
    }
  }

  async deleteBlog(id: string, userId: string) {
    try {
      // Check if blog exists and user is the author
      const existingBlog = await this.prisma.blog.findUnique({
        where: { id },
        select: { authorId: true },
      });

      if (!existingBlog) {
        throw new NotFoundException('Blog not found');
      }

      if (existingBlog.authorId !== userId) {
        throw new ForbiddenException('You can only delete your own blogs');
      }

      await this.prisma.blog.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Blog deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error(`Failed to delete blog: ${error.message}`);
    }
  }

  async likeBlog(blogId: string, userId: string) {
    try {
      // Check if user already liked the blog
      const existingLike = await this.prisma.like.findUnique({
        where: {
          userId_blogId: {
            userId,
            blogId,
          },
        },
      });

      if (existingLike) {
        // Unlike the blog
        await this.prisma.like.delete({
          where: { id: existingLike.id },
        });

        await this.prisma.blog.update({
          where: { id: blogId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        });

        return {
          success: true,
          message: 'Blog unliked successfully',
          data: { isLiked: false },
        };
      } else {
        // Like the blog
        await this.prisma.like.create({
          data: {
            userId,
            blogId,
          },
        });

        await this.prisma.blog.update({
          where: { id: blogId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        });

        return {
          success: true,
          message: 'Blog liked successfully',
          data: { isLiked: true },
        };
      }
    } catch (error) {
      throw new Error(`Failed to like/unlike blog: ${error.message}`);
    }
  }

  async getUserBlogs(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [blogs, total] = await Promise.all([
        this.prisma.blog.findMany({
          where: { authorId: userId },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: {
              select: {
                id: true,
                userName: true,
                name: true,
                images: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                views: true,
              },
            },
          },
        }),
        this.prisma.blog.count({
          where: { authorId: userId },
        }),
      ]);

      return {
        success: true,
        message: 'User blogs retrieved successfully',
        data: {
          blogs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get user blogs: ${error.message}`);
    }
  }

  async addComment(
    blogId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    try {
      // Check if blog exists
      const blog = await this.prisma.blog.findUnique({
        where: { id: blogId },
        select: { id: true },
      });

      if (!blog) {
        throw new NotFoundException('Blog not found');
      }

      // Create comment
      const comment = await this.prisma.comment.create({
        data: {
          content: createCommentDto.content,
          userId,
          blogId,
        },
        include: {
          user: {
            select: {
              id: true,
              userName: true,
              name: true,
              images: true,
            },
          },
        },
      });

      // Increment comment count
      await this.prisma.blog.update({
        where: { id: blogId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });

      return {
        success: true,
        message: 'Comment added successfully',
        data: comment,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to add comment: ${error.message}`);
    }
  }

  async getBlogComments(blogId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        this.prisma.comment.findMany({
          where: { blogId },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                userName: true,
                name: true,
                images: true,
              },
            },
          },
        }),
        this.prisma.comment.count({
          where: { blogId },
        }),
      ]);

      return {
        success: true,
        message: 'Comments retrieved successfully',
        data: {
          comments,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to get comments: ${error.message}`);
    }
  }

  async deleteComment(commentId: string, userId: string) {
    try {
      // Check if comment exists and user is the author
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true, blogId: true },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      // Delete comment
      await this.prisma.comment.delete({
        where: { id: commentId },
      });

      // Decrement comment count
      await this.prisma.blog.update({
        where: { id: comment.blogId },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      });

      return {
        success: true,
        message: 'Comment deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  async searchBlogs(searchTerm: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [blogs, total] = await Promise.all([
        this.prisma.blog.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                shortInto: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                themes: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                conclusion: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            ],
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: {
              select: {
                id: true,
                userName: true,
                name: true,
                images: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                views: true,
              },
            },
          },
        }),
        this.prisma.blog.count({
          where: {
            OR: [
              {
                title: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                shortInto: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                themes: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
              {
                conclusion: {
                  contains: searchTerm,
                  mode: 'insensitive',
                },
              },
            ],
          },
        }),
      ]);

      return {
        success: true,
        message: 'Search results retrieved successfully',
        data: {
          blogs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          searchTerm,
        },
      };
    } catch (error) {
      throw new Error(`Failed to search blogs: ${error.message}`);
    }
  }

  async getBlogsByTheme(theme: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [blogs, total] = await Promise.all([
        this.prisma.blog.findMany({
          where: {
            themes: {
              contains: theme,
              mode: 'insensitive',
            },
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: {
              select: {
                id: true,
                userName: true,
                name: true,
                images: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                views: true,
              },
            },
          },
        }),
        this.prisma.blog.count({
          where: {
            themes: {
              contains: theme,
              mode: 'insensitive',
            },
          },
        }),
      ]);

      return {
        success: true,
        message: 'Blogs by theme retrieved successfully',
        data: {
          blogs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          theme,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get blogs by theme: ${error.message}`);
    }
  }

  private async incrementViewCount(blogId: string, userId: string) {
    try {
      // Check if user already viewed the blog today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingView = await this.prisma.view.findFirst({
        where: {
          blogId,
          userId,
          createdAt: {
            gte: today,
          },
        },
      });

      if (!existingView) {
        // Create new view record
        await this.prisma.view.create({
          data: {
            blogId,
            userId,
          },
        });

        // Increment view count
        await this.prisma.blog.update({
          where: { id: blogId },
          data: {
            viewCount: {
              increment: 1,
            },
          },
        });
      }
    } catch (error) {
      // Don't throw error for view count issues
      console.error('Failed to increment view count:', error);
    }
  }
}
