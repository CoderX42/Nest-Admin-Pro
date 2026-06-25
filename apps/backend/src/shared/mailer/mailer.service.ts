import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor(private readonly cfg: ConfigService) {
    const c = cfg.get<any>('mail');
    this.from = c.from || 'noreply@example.com';
    if (!c.host) {
      this.logger.warn('SMTP not configured, mailer disabled');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host: c.host,
      port: c.port,
      secure: c.secure,
      auth: c.user ? { user: c.user, pass: c.pass } : undefined,
    });
  }

  async send(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`[mailer disabled] would send to=${to} subject=${subject}`);
      return false;
    }
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      return true;
    } catch (err) {
      this.logger.error(`send mail failed: ${(err as Error).message}`);
      return false;
    }
  }
}
