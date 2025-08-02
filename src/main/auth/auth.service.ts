import { JwtService } from '@nestjs/jwt';

import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from "bcrypt";
import { access } from 'fs';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
    private readonly jwtService: JwtService) { }

  async createUser(dto: CreateUserDto) {
    try {
      const isUserExist = await this.prisma.user.findFirst({
        where: {
          email: dto.email
        }
      });
      if (isUserExist) {
        throw new BadRequestException('User already exist');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const result = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
        }
      });
      // console.log("credential", result);
      return { message: "User created successfully", result };
    } catch (err) {
      // console.log(err);
      return { message: "User creation failed", err };
    }

  }

  async login(dto: LoginDto) {

    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: dto.email
        }
      });
      if (
        !user) {
        throw new BadRequestException('User does not exist, create user first');
      }

      const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordMatch) {
        throw new BadRequestException('Password does not match');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        roles: user.role
      };

      const token = await this.jwtService.signAsync(payload);

      return { message: "User login successfully", access_token: token };
    } catch (err) {
      // console.log(err);
      return { message: "User login failed", err };
    }

  }


  
 async googleLogin(profile: any) {
  const existingUser = await this.prisma.user.findUnique({
    where: {
      email: profile.email,
    },
  });

  let user;

  if (!existingUser) {
    // Create new user with Google profile info
    user = await this.prisma.user.create({
      data: {
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
        userName: profile.email.split('@')[0],
        images: profile.picture,
        password: '', // Google users don't have local password
        role: 'USER',
      },
    });
  } else {
    // Use existing user
    user = existingUser;
  }

  //  Generate JWT token
  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.role,
  };

  const token = this.jwtService.sign(payload);
  return {
    access_token: token,
    message: existingUser ? 'Login successful' : 'Account created and logged in',
  };
}



}
