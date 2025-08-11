import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import { successResponse } from '@project/common/utils/response.util';
import { HandleError } from '@project/common/error/handle-error.decorator';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        blogs: true,
        likes: true,
        comments: true,
        views: true,
      },
    });
    return successResponse(users, 'Users fetched successfully!');
  }
  async getSingelUser(id: string) {
    const users = await this.prisma.user.findUnique({
      where: { id },
    });
    return successResponse(users, 'Users fetched successfully!');
  }

  async updateUserProfile(userId: string, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateUserDto,
        select: {
          id: true,
          userName: true,
          email: true,
          role: true,
          name: true,
          images: true,
          location: true,
          bio: true,
          phoneNo: true,
          isPopular: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              blogs: true,
              likes: true,
              comments: true,
              views: true,
            },
          },
        },
      });

      return {
        success: true,
        message: 'User profile updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  async editUserProfile(userId: string, dto: EditProfileDto) {
    try {
      const { images,name,location,bio } = dto;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          name:name?.trim()?name.trim():user.name,
          location:location?.trim()?location.trim():user.location,
          bio:bio?.trim()?bio.trim():user.bio,
          images:images?.trim()?images.trim():user.images
        },
      });
    }
    catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }
}