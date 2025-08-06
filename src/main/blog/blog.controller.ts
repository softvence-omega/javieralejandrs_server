import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser, ValidateAuth } from '@project/common/jwt/jwt.decorator';
import { JwtAuthGuard } from '@project/common/jwt/jwt.guard';
import { Request } from 'express';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new blog post' })
  @ValidateAuth()
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.blogService.createBlog(createBlogDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog posts retrieved successfully',
  })
  async getAllBlogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.blogService.getAllBlogs(pageNum, limitNum);
  }

  @Get('my-blogs')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user blog posts' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'User blog posts retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async getUserBlogs(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.blogService.getUserBlogs(req.user.id, pageNum, limitNum);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search blog posts' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchBlogs(
    @Query('q') searchTerm: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.blogService.searchBlogs(searchTerm, pageNum, limitNum);
  }

  @Get('theme/:theme')
  @ApiOperation({ summary: 'Get blog posts by theme' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Blogs by theme retrieved successfully',
  })
  async getBlogsByTheme(
    @Param('theme') theme: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.blogService.getBlogsByTheme(theme, pageNum, limitNum);
  }

  @Get(':id')
  @ValidateAuth()
  @ApiOperation({ summary: 'Get a blog post by ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog post retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async getBlogById(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    const user_Id = userId; // Optional userId for authenticated users
    return this.blogService.getBlogById(id, user_Id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiResponse({
    status: 200,
    description: 'Blog post updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own blogs',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.blogService.updateBlog(id, updateBlogDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiResponse({
    status: 200,
    description: 'Blog post deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own blogs',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async deleteBlog(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.blogService.deleteBlog(id, req.user.id);
  }

  @Post(':id/like')
  @ValidateAuth()
  @ApiOperation({ summary: 'Like or unlike a blog post' })
  @ApiResponse({
    status: 200,
    description: 'Blog post liked/unliked successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async likeBlog(@Param('id') id: string, @GetUser('userId') userId: string) {
    return this.blogService.likeBlog(id, userId);
  }

  @Post(':id/comment')
  @ValidateAuth()
  @ApiOperation({ summary: 'Add a comment to a blog post' })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async addComment(
    @Param('id') blogId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser('userId') userId: string,
  ) {
    return this.blogService.addComment(blogId, userId, createCommentDto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for a blog post' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
  })
  async getBlogComments(
    @Param('id') blogId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.blogService.getBlogComments(blogId, pageNum, limitNum);
  }

  @Delete('comment/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own comments',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.blogService.deleteComment(commentId, req.user.id);
  }
}
