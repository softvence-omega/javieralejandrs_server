import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
// import { GoogleStrategy } from './strategies/google-auth.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guard/googl-oauth.guard';
import { Serializer } from './strategies/serializer';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthGuard, Serializer],
  exports: [JwtModule],
})
export class AuthModule {}
