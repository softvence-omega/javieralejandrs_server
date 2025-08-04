import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleAuthGuard } from './guard/googl-oauth.guard';
import { PrismaService } from '../prisma/prisma.service';
import admin from '@project/lib/firebase/firebase-admin';
// import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FirebaseLoginDto } from './dto/firebase.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { GoogleLoginDto } from './dto/google.login.dto';


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


  
  @Post('forgot-password')
  @ApiResponse({ status: 200, description: 'Reset email sent successfully' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }


 @Post('google/code')
  async handleGoogleCode(@Body() code: GoogleLoginDto) {
    const { tokens, profile } = await this.authService.exchangeCodeForTokens(code.code);
    console.log(pro)
  //     id         String       @unique @default(uuid())
  // userName   String?
  // email      String       @unique
  // password   String
  // role       userRole     @default(USER)
  // name       String?
  // images     String?
  // location   String?
  // bio        String?
  // phoneNo    String?
  // provider    String?   
  // providerId  String?  
  // resetToken  String?
  // resetTokenExpiry DateTime? 
  // isPopular  Boolean? //use for author
  // createdAt  DateTime     @default(now())
  // updatedAt  DateTime     @updatedAt

    const user = {
      userName: `@${(profile.name)?.toLowerCase()}`,
      email:profile.email,
      name:profile.name,
      images: profile.picture,
      role: "USER",
      password:""
    }
    // Optionally save user / issue JWT
    // return {
    //   user: profile,
    //   tokens,
    // };
    return await this.authService.googleLogin(user)
  }

  // @Get('google/callback')
  // @UseGuards(GoogleAuthGuard)
  // async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {

  //   console.log(req.user, 'req.user');
  //   // try {
  //   //   console.log('googleAuthRedirect', req.user);
  //   //   const token = await this.authService.googleLogin(req.user);
  //   //   console.log('Token:', token);
  //   //   return res.redirect(`${process.env.CLIENT_URL}?token=${token.accessToken}`);
  //   // } catch (err) {
  //   //   console.error('Google login error:', err);
  //   //   return res.status(500).json({
  //   //     success: false,
  //   //     message: 'Internal server error',
  //   //     data: null,
  //   //   });
  //   // }
  // }

  // @Get('status')
  // user(@Req() request: Request) {
  //   console.log(request.user);
  //   if (request.user) {
  //     return { msg: 'Authenticated' };
  //   } else {
  //     return { msg: 'Not Authenticated' };
  //   }
  // }

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
