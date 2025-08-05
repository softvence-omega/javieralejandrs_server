import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
}
