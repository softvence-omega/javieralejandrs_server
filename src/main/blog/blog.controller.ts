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
import { JwtAuthGuard } from '@project/common/jwt/jwt.guard';
import { Request } from 'express';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({
    status: 201,
    description: 'Blog post created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.blogService.createBlog(createBlogDto, req.user.id);
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a blog post by ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog post retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
  })
  async getBlogById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user?.id; // Optional user for view tracking
    return this.blogService.getBlogById(id, userId);
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Like or unlike a blog post' })
  @ApiResponse({
    status: 200,
    description: 'Blog post liked/unliked successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  async likeBlog(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.blogService.likeBlog(id, req.user.id);
  }
}
