import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { SendMailDto } from './dto/mail.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    this.fromAddress =
      this.configService.get<string>('mail.from') ||
      this.configService.get<string>('mail.user') ||
      'no-reply@example.com';
  }

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port', 587);
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');

    if (!host || !user || !pass) {
      throw new BadRequestException(
        '邮件服务未配置：请先在 .env 中设置 MAIL_HOST / MAIL_USER / MAIL_PASS',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    this.transporter
      .verify()
      .then(() => this.logger.log(`Mail transporter ready (${host}:${port})`))
      .catch((err) => this.logger.error(`Mail transporter verify failed: ${err.message}`));

    return this.transporter;
  }

  async send(dto: SendMailDto) {
    const transporter = this.getTransporter();
    const info = await transporter.sendMail({
      from: this.fromAddress,
      to: dto.to.join(', '),
      subject: dto.subject,
      html: dto.html,
      text: dto.text,
    });
    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      to: dto.to,
      subject: dto.subject,
    };
  }

  async test(to: string) {
    return this.send({
      to: [to],
      subject: 'Nest-Admin-Pro · 邮件服务连通性测试',
      html: `<p>这是一封来自 <strong>Nest-Admin-Pro</strong> 的测试邮件。</p><p>发送时间：${new Date().toISOString()}</p>`,
      text: 'Nest-Admin-Pro test mail',
    });
  }
}
