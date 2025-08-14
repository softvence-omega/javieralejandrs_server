import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../../lib/mail/mail.service';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Credentials } from 'google-auth-library';
import { google, oauth2_v2 } from 'googleapis';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  ForgetPasswordDto,
  ResetPasswordDto,
} from '../dto/forget-password.dto';
import { LoginDto } from '../dto/login.dto';
import { GoogleLoginDetails } from '../entities/googleLoginDetails';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground', // must match Playground
  );

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
    // console.log(newUser);
    return newUser;
  }

  async findUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    return user;
  }

  getGoogleAuthURL(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
    });
  }

  async getGoogleUser(code: string): Promise<{
    tokens: Credentials;
    profile: oauth2_v2.Schema$Userinfo;
  }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data } = await oauth2.userinfo.get();

    return {
      tokens,
      profile: data,
    };
  }

  async exchangeCodeForTokens(code: string): Promise<{
    tokens: Credentials;
    profile: oauth2_v2.Schema$Userinfo;
  }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data } = await oauth2.userinfo.get();

    return {
      tokens,
      profile: data,
    };
  }

  async googleLogin(profile: any): Promise<{ accessToken: string; user: any }> {
    try {
      console.log('🔍 googleLogin input profile:', profile);

      const existingUser = await this.prisma.user.findFirst({
        where: { email: profile.email },
      });

      if (existingUser) {
        throw new BadRequestException('User Already Exist!!!');
      }
      let user;

      if (!existingUser) {
        user = await this.prisma.user.create({
          data: profile,
        });
        console.log('Created new user:', user);
      }

      const payload = {
        sub: user?.id,
        email: user?.email,
        role: user?.role,
      };

      const accessToken = await this.jwtService.signAsync(payload);
      return { accessToken, user };
    } catch (error) {
      console.error(' Error in googleLogin:', error);
      throw error;
    }
  }

  // async loginWithFirebase(idToken: string) {
  //   let decoded;
  //   try {
  //     decoded = await admin.auth().verifyIdToken(idToken);
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid Firebase ID token');
  //   }

  //   const { email, name, picture } = decoded;

  //   if (!email) {
  //     throw new UnauthorizedException('Firebase token has no email');
  //   }

  //   let user = await this.prisma.user.findUnique({ where: { email } });

  //   if (!user) {
  //     user = await this.prisma.user.create({
  //       data: {
  //         email,
  //         userName: name?.split(' ').join('_') || undefined,
  //         name: name || undefined,
  //         images: picture || undefined,
  //         password: '', // No password required for Firebase users
  //         role: 'USER',
  //       },
  //     });
  //   }

  //   const payload = {
  //     sub: user.id,
  //     email: user.email,
  //     role: user.role,
  //   };

  //   const accessToken = this.jwtService.sign(payload);

  //   return {
  //     message: 'Login successful',
  //     accessToken,
  //     user,
  //   };
  // }
}
