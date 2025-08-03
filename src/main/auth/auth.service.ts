import { JwtService } from '@nestjs/jwt';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from "bcrypt";
import { access } from 'fs';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDetails } from './entities/googleLoginDetails';
import admin from '@project/lib/firebase/firebase-admin';


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



async validateUser(details: GoogleLoginDetails ) {
  const user = await this.prisma.user.findFirst({
    where: {
      email: details.email,
    },
  })
  if(user){
    return user
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
  console.log(newUser)
  return newUser
}

async findUser(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return user;
}

// async googleLogin(profile: any): Promise<{ accessToken: string }> {
//   try {
//     console.log('🔍 googleLogin input profile:', profile);

//     const existingUser = await this.prisma.user.findFirst({
//       where: { email: profile.email },
//     });

//     let user = existingUser;

//     if (!existingUser) {
//       user = await this.prisma.user.create({
//         data: {
//           name: profile.firstName + ' ' + profile.lastName,
//           userName: profile.email.split('@')[0],
//           email: profile.email,
//           images: profile.picture,
//           password: '',
//           role: 'USER',
//         },
//       });
//       console.log('Created new user:', user);
//     }

//    const payload = {
//   sub: user?.id,
//   email: user?.email,
//   role: user?.role,
// };

//     const accessToken = await this.jwtService.signAsync(payload);
//     return { accessToken };
//   } catch (error) {
//     console.error(' Error in googleLogin:', error);
//     throw error;
//   }
// }

  
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
