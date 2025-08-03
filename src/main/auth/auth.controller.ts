import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { GoogleAuthGuard } from './guard/googl-oauth.guard';
import { PrismaService } from '../prisma/prisma.service';
import admin from '@project/lib/firebase/firebase-admin';
// import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FirebaseLoginDto } from './dto/firebase.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly prisma: PrismaService) { }

  @Post('create-user')
  async createUser(@Body() dto: CreateUserDto) {
    return await this.authService.createUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }


  @Get('google')
  @ApiOperation({ summary: 'Login with Google' })
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {

    console.log(req.user, 'req.user');
    // try {
    //   console.log('googleAuthRedirect', req.user);
    //   const token = await this.authService.googleLogin(req.user);
    //   console.log('Token:', token);
    //   return res.redirect(`${process.env.CLIENT_URL}?token=${token.accessToken}`);
    // } catch (err) {
    //   console.error('Google login error:', err);
    //   return res.status(500).json({
    //     success: false,
    //     message: 'Internal server error',
    //     data: null,
    //   });
    // }
  }

  @Get('status')
  user(@Req() request: Request) {
    console.log(request.user);
    if (request.user) {
      return { msg: 'Authenticated' };
    } else {
      return { msg: 'Not Authenticated' };
    }
  }

  // @Post('firebase-login')
  // @ApiOperation({ summary: 'Login using Firebase Google ID token' })
  // @ApiBody({ type: FirebaseLoginDto })
  // @ApiResponse({ status: 201, description: 'User authenticated and JWT returned' })
  // async firebaseLogin(@Body() body: FirebaseLoginDto) {
  //   return await this.authService.loginWithFirebase(body.idToken);
  // }

  // @Get('google-test')
  // @ApiOperation({ summary: 'Manual Google login test (Swagger)' })
  // async testRedirect(@Res() res: Response) {
  //   return res.redirect('http://localhost:5003/ts/auth/google');
  // }
}
