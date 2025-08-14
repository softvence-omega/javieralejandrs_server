import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import {
  ForgetPasswordDto,
  ResetPasswordDto,
  SendOtpDto,
  VerifyOtpDto,
} from './dto/forget-password.dto';
import { GoogleLoginDto } from './dto/google.login.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './services/auth.service';
import { VerifyOtpService } from './services/verify-otp.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly verifyOtpService: VerifyOtpService,
  ) {}

  @Post('create-user')
  async createUser(@Body() dto: CreateUserDto) {
    return await this.authService.createUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  //  Forgot Password
  @Post('forgot-password')
  @ApiResponse({ status: 200, description: 'Reset email sent successfully' })
  async forgotPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  //  Verify Reset Token
  // @ApiBearerAuth()
  // @ValidateAuth()
  // @Get('verify-reset-token')
  // verifyResetToken(@Query() dto: VerifyResetTokenDto) {
  //   return this.authService.verifyResetToken(dto);
  // }

  //  Reset Password
  // @ApiBearerAuth()
  // @ValidateAuth()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // OTP: Send
  @Post('send-otp')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.verifyOtpService.sendOtp(dto.email);
  }

  // OTP: Verify
  @Post('verify-otp')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.verifyOtpService.verifyOtp(dto.email, dto.otp);
  }

  @Post('google/code')
  async handleGoogleCode(@Body() code: GoogleLoginDto) {
    const { profile } = await this.authService.exchangeCodeForTokens(code.code);

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
