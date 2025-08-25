import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../../lib/mail/mail.service';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as crypto from 'crypto';
// import { Credentials } from 'google-auth-library';
// import { google, oauth2_v2 } from 'googleapis';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  ForgetPasswordDto,
  ResetPasswordDto,
} from '../dto/forget-password.dto';
import { LoginDto } from '../dto/login.dto';
import { GoogleLoginDetails } from '../entities/googleLoginDetails';
import { JWTPayload } from '@project/common/jwt/jwt.interface';
import { ConfigService } from '@nestjs/config';
import { GoogleLoginDto } from '../dto/google.login.dto';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@project/lib/prisma/prisma.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // private oauth2Client = new google.auth.OAuth2(
  //   process.env.GOOGLE_CLIENT_ID,
  //   process.env.GOOGLE_CLIENT_SECRET,
  //   process.env.GOOGLE_CALLBACK_URL
  //   'https://developers.google.com/oauthplayground', // must match Playground
  // );

  async createUser(dto: CreateUserDto) {
    try {
      const isUserExist = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });
      if (isUserExist) {
        throw new BadRequestException('User already exist');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const result = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
        },
      });
      // console.log("credential", result);
      return { message: 'User created successfully', result };
    } catch (err) {
      // console.log(err);
      return { message: 'User creation failed', err };
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });
      if (!user) {
        throw new BadRequestException('User does not exist, create user first');
      }

      const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordMatch) {
        throw new BadRequestException('Password does not match');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.role,
      };

      const token = await this.jwtService.signAsync(payload);

      return { message: 'User login successfully', access_token: token };
    } catch (err) {
      // console.log(err);
      return { message: 'User login failed', err };
    }
  }

  //  Forgot Password

  async forgotPassword(dto: ForgetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('User not found');

    // Generate raw token
    const token = crypto.randomBytes(32).toString('hex');

    // Hash token for DB
    // const hashedToken = crypto
    //   .createHash('sha256')
    //   .update(token)
    //   .digest('hex');

    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        // resetToken: hashedToken,
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await this.mailService.sendEmail(
      user.email,
      'Reset Your Password',
      `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name ?? 'user'},</p>
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <a href="${resetLink}">${resetLink}</a>
    `,
    );

    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Token hashing ()
    // const hashedToken = crypto
    //   .createHash('sha256')
    //   .update(dto.token)
    //   .digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successful' };
  }

  async validateUser(details: GoogleLoginDetails) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: details.email,
      },
    });
    if (user) {
      return user;
    }
    const newUser = await this.prisma.user.create({
      data: {
        name: details.name,
        userName: details.email.split('@')[0],
        email: details.email,
        images: details.picture,
        password: '', // No password from Google
        role: 'USER',
      },
    });
    console.log(newUser);
    return newUser;
  }

  async googleLogin(dto: GoogleLoginDto) {
    const { idToken } = dto;
    console.log('idToken', idToken);
    try {
      if (!idToken) {
        throw new BadRequestException('Google ID token is required');
      }

      const payload = await this.verifyGoogleToken(idToken);

      // * Check if user already exists
      let user = await this.prisma.user.findUnique({
        where: { email: payload?.email },
      });

      if (!user) {
        // * Create new user
        user = await this.prisma.user.create({
          data: {
            email: payload?.email as string,
            googleId: payload?.sub as string,
            name: payload?.name || '',
            password: '',
          },
        });
      } else if (!user.googleId) {
        // * Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: payload?.sub,
            isVerified: true,
          },
        });
      }

      const token = this.generateToken({
        sub: user.id,
        email: user.email,
        roles: user.role ?? '',
      });

      return {
        user,
        token,
      };
    } catch (error) {
      return { message: 'Google login creation failed', error };
    }
  }

  private async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      console.log('payload', payload);
      if (!payload) {
        throw new Error('Invalid Google token');
      }
      const { email, sub } = payload;
      if (!email || !sub) {
        throw new Error('Invalid Google token');
      }
      return payload;
    } catch (error) {
      console.log('error on verifyGoogleToken', error);
      return error.message;
    }
  }

  private generateToken(payload: JWTPayload): string {
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return token;
  }

  async findUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  }
}

// getGoogleAuthURL(): string {
//   const scopes = [
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile',
//     'openid',
//   ];

//   return this.oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     prompt: 'consent',
//     scope: scopes,
//   });
// }

// async getGoogleUser(code: string): Promise<{
//   tokens: Credentials;
//   profile: oauth2_v2.Schema$Userinfo;
// } | undefined> {
//  try{ const { tokens } = await this.oauth2Client.getToken(code);
//   this.oauth2Client.setCredentials(tokens);

//   const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
//   const { data } = await oauth2.userinfo.get();

//   return {
//     tokens,
//     profile: data,
//   };
//  }catch(err){
//   console.log(err);
// }}

// async exchangeCodeForTokens(code: string): Promise<{
//   tokens: Credentials;
//   profile: oauth2_v2.Schema$Userinfo;
// }|undefined> {
//  try{
//    const { tokens } = await this.oauth2Client.getToken(code);
//   this.oauth2Client.setCredentials(tokens);

//   const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
//   const { data } = await oauth2.userinfo.get();

//   return {
//     tokens,
//     profile: data,
//   };
//  }catch(err){
//   console.log(err);

//  }
// }

// async googleLogin(profile: any): Promise<{ accessToken: string; user: any }> {
//   try {
//     console.log('🔍 googleLogin input profile:', profile);

//     const existingUser = await this.prisma.user.findFirst({
//       where: { email: profile.email },
//     });

//     if (existingUser) {
//       throw new BadRequestException('User Already Exist!!!');
//     }
//     let user;

//     if (!existingUser) {
//       user = await this.prisma.user.create({
//         data: profile,
//       });
//       console.log('Created new user:', user);
//     }

//     const payload = {
//       sub: user?.id,
//       email: user?.email,
//       role: user?.role,
//     };

//     const accessToken = await this.jwtService.signAsync(payload);
//     return { accessToken, user };
//   } catch (error) {
//     console.error(' Error in googleLogin:', error);
//     throw error;
//   }
// }
