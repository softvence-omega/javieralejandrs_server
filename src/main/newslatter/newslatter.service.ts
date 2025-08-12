import { Injectable, Logger } from '@nestjs/common';
import { CreateNewslatterDto } from './dto/create-newslatter.dto';
import { successResponse } from '@project/common/utils/response.util';
import { PrismaService } from '@project/lib/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ENVEnum } from '@project/common/enum/env.enum';
import { AppError } from '@project/common/error/handle-error.app';
import { MailService } from '@project/lib/mail/mail.service';

@Injectable()
export class NewslatterService {
  private readonly logger = new Logger(NewslatterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}
  async create(dto: CreateNewslatterDto) {
    try {
      const isSubscribed = await this.prisma.newslatter.findUnique({
        where: {
          email: dto.email,
        },
      });
      if (isSubscribed) {
        throw new AppError(400, 'You are already subscribed');
      }
      const result = await this.prisma.newslatter.create({
        data: {
          ...dto,
        },
      });

      const adminEmail = this.config.getOrThrow<string>(ENVEnum.MAIL_USER);
      if (!adminEmail) {
        this.logger.error('Admin email not found in environment variables');
        throw new AppError(404, 'Admin email not found');
      }
      const adminSubject = `Newslatter Form Submission`;
      const adminMessage = `
    <h2>Newslatter Message</h2>
    <p>Email: ${dto.email}</p>
    `;
      await this.mailService.sendEmail(adminEmail, adminSubject, adminMessage);

      const userSubject = `Thank you for subscribing to our newslatter`;
      const userMessage = `
    <h2>Received Your Message</h2>
    <p>Thanks for subscribing to our newslatter. We will keep you updated with the latest news and offers.</p>
    `;
      await this.mailService.sendEmail(dto.email, userSubject, userMessage);

      return successResponse(result, 'Newslatter created successfully!');
    } catch (err) {
      // console.log(err, 'err');
      return { message: 'Newslatter creation failed', err };
    }
  }

  async findAll() {
    const result = await this.prisma.newslatter.findMany();
    return successResponse(result, 'Newslatter fetched successfully!');
  }

  async findOne(id: string) {
    const result = await this.prisma.newslatter.findUnique({ where: { id } });
    return successResponse(result, 'Newslatter fetched successfully!');
  }

  // update(id: number, updateNewslatterDto: UpdateNewslatterDto) {
  //   return `This action updates a #${id} newslatter`;
  // }

  async remove(id: string) {
    const result = await this.prisma.newslatter.delete({ where: { id } });
    return successResponse(result, 'Newslatter deleted successfully!');
  }
}
