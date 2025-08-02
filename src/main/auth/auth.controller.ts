import { Body, Controller,  Get,  Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('create-user')
  async createUser(@Body() dto: CreateUserDto) {
    return await this.authService.createUser(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

    @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    const result = await this.authService.googleLogin(user);
    console.log(result, 'result');

    // Option 1: Redirect with token in query
    return res.redirect(
      `${process.env.FRONTEND_BASE_URL}/oauth-success?token=${result.access_token}`
    );

    //  Option 2: (alternative) Send token as JSON
    // return res.json(result);
  }

}
