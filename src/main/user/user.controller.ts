import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetUser,
  ValidateAdmin,
  ValidateAuth,
} from '../../common/jwt/jwt.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '@project/lib/cloudinary/cloudinary.service';
import { EditProfileDto } from './dto/edit-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SocialProfileDto } from './dto/social-profile.dto';

@ApiTags('Users')
@Controller('user/me')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('all-users')
  @ValidateAdmin()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get('user/:id')
  @ValidateAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single user' })
  async getSingelUsers(@GetUser('userId') userId: string) {
    return await this.userService.getSingelUser(userId);
  }

  @Put('profile')
  @ValidateAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @GetUser('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserProfile(userId, updateUserDto);
  }

  @Put('edit-profile')
  @ValidateAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @UseInterceptors(FileInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  async editProfile(
    @GetUser('userId') userId: string,
    @Body() dto: EditProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      let imageUrl: string | undefined;

      if (file) {
        const uploadResult = await this.cloudinaryService.uploadImageFromBuffer(
          file.buffer,
          file.originalname,
          'profile-images',
        );
        imageUrl = uploadResult.secure_url;
      }

      return await this.userService.editUserProfile(userId, {
        ...dto,
        ...(imageUrl && { images: imageUrl }),
      });
    } catch (error) {
      console.error('editProfile error:', error);
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  // Update Password
  @Post('update-password')
  @ValidateAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  async updatePassword(
    @GetUser('userId') userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return await this.userService.updatePassword(userId, dto);
  }

  // SocialProfile
  @Post('social-profile')
  @ValidateAuth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a user' })
  async socialProfile(
    @GetUser('userId') userId: string,
    @Body() dto: SocialProfileDto,
  ) {
    return await this.userService.socialProfile(userId, dto);
  }
}
