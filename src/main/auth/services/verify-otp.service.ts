import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '@project/lib/mail/mail.service';
import { PrismaService } from '@project/lib/prisma/prisma.service';
import { VerifyResetTokenDto } from '../dto/forget-password.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class VerifyOtpService {
  private otpStore = new Map<string, { otp: string; expires: Date }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  //  Verify Reset Token
  async verifyResetToken(dto: VerifyResetTokenDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.id } });
    if (!user || !user.resetToken || user.resetTokenExpiry! < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    // console.log(user.resetToken, 'user.resetToken');
    // console.log(token, 'token');
    const isMatch = await bcrypt.compare(dto.token, user.resetToken);
    if (!isMatch) throw new BadRequestException('Invalid token');

    return { valid: true };
  }

  // OTP: Send
  async sendOtp(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    this.otpStore.set(email, {
      otp,
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    await this.mailService.sendEmail(
      email,
      'Your OTP Code',
      `<p>Your OTP code is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    );

    return { message: 'OTP sent to email' };
  }

  // OTP: Verify
  async verifyOtp(email: string, otp: string) {
    const record = this.otpStore.get(email);
    if (!record || record.expires < new Date()) {
      throw new BadRequestException('OTP expired or invalid');
    }

    if (record.otp !== otp) throw new BadRequestException('Invalid OTP');

    this.otpStore.delete(email);
    return { valid: true };
  }
}
