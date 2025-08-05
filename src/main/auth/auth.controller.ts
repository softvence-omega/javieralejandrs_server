import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from './guard/googl-oauth.guard';
import { PrismaService } from '../prisma/prisma.service';
import admin from '@project/lib/firebase/firebase-admin';
// import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FirebaseLoginDto } from './dto/firebase.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { GoogleLoginDto } from './dto/google.login.dto';



@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('create-user')
  async createUser(@Body() dto: CreateUserDto) {
    return await this.authService.createUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('forgot-password')
  @ApiResponse({ status: 200, description: 'Reset email sent successfully' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('google/code')
  async handleGoogleCode(@Body() code: GoogleLoginDto) {
    const { tokens, profile } = await this.authService.exchangeCodeForTokens(
      code.code,
    );

    const user = {
      userName: `@${profile.name?.toLowerCase()}`,
      email: profile.email,
      name: profile.name?.split(' ').join(''),
      images: profile.picture,
      role: 'USER',
      password: '',
    };
    return await this.authService.googleLogin(user);
  }
}
