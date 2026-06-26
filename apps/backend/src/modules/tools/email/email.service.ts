import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { MailLogEntity } from './entities/mail-log.entity';
import { SendMailDto } from './dto/mail.dto';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

export interface MailListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(
    @InjectRepository(MailLogEntity) private readonly repo: Repository<MailLogEntity>,
    private readonly config: ConfigService,
  ) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = this.config.get<string>('mail.host');
    const user = this.config.get<string>('mail.user');
    if (!host || !user) {
      this.logger.warn('[mail] SMTP not configured (mail.host/user missing); send will fail');
      return;
    }
    this.transporter = nodemailer.createTransport({
      host,
      port: this.config.get<number>('mail.port') ?? 465,
      secure: this.config.get<boolean>('mail.secure') ?? true,
      auth: { user, pass: this.config.get<string>('mail.pass') ?? '' },
    });
    this.logger.log(`[mail] transporter ready: ${user}@${host}`);
  }

  async send(dto: SendMailDto, uid: number, username: string): Promise<MailLogEntity> {
    const from = this.config.get<string>('mail.from') ?? 'noreply@example.com';
    const start = Date.now();

    const log = this.repo.create({
      from,
      to: JSON.stringify(dto.to),
      cc: dto.cc ? JSON.stringify(dto.cc) : null,
      bcc: dto.bcc ? JSON.stringify(dto.bcc) : null,
      subject: dto.subject,
      content: dto.content,
      isHtml: dto.isHtml ? 1 : 0,
      status: 0,
      cost: 0,
      uid,
      username,
    });
    const saved = await this.repo.save(log);

    if (!this.transporter) {
      const msg = 'SMTP not configured; please set SMTP_HOST/SMTP_USER env vars';
      saved.status = 2;
      saved.errorMessage = msg;
      await this.repo.save(saved);
      throw new BusinessException(ErrorEnum.MAIL_SEND_FAILED, msg);
    }

    try {
      const info = await this.transporter.sendMail({
        from,
        to: dto.to.join(','),
        cc: dto.cc?.join(','),
        bcc: dto.bcc?.join(','),
        subject: dto.subject,
        text: dto.isHtml ? undefined : dto.content,
        html: dto.isHtml ? dto.content : undefined,
      });
      saved.status = 1;
      saved.cost = Date.now() - start;
      await this.repo.save(saved);
      this.logger.log(
        `[mail] sent id=${saved.id} to=${dto.to.join(',')} messageId=${info.messageId} cost=${saved.cost}ms`,
      );
      return saved;
    } catch (err: any) {
      saved.status = 2;
      saved.errorMessage = String(err?.message ?? err).slice(0, 500);
      saved.cost = Date.now() - start;
      await this.repo.save(saved);
      this.logger.error(`[mail] failed id=${saved.id} err=${saved.errorMessage}`);
      throw new BusinessException(
        ErrorEnum.MAIL_SEND_FAILED,
        saved.errorMessage ?? 'mail send failed',
      );
    }
  }

  async list(query: MailListQuery) {
    const page = Math.max(1, Number(query.page ?? 1));
    const pageSize = Math.max(1, Math.min(200, Number(query.pageSize ?? 10)));
    const qb = this.repo.createQueryBuilder('m').orderBy('m.id', 'DESC');
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere('(m.subject LIKE :kw OR m.to LIKE :kw OR m.username LIKE :kw)', { kw });
    }
    if (query.status !== undefined && query.status !== null) {
      qb.andWhere('m.status = :status', { status: query.status });
    }
    const [items, total] = await qb.take(pageSize).skip((page - 1) * pageSize).getManyAndCount();
    return {
      items: items.map((m) => ({
        id: m.id,
        from: m.from,
        to: safeParse(m.to),
        cc: safeParse(m.cc ?? ''),
        bcc: safeParse(m.bcc ?? ''),
        subject: m.subject,
        content: m.content,
        isHtml: m.isHtml,
        status: m.status,
        errorMessage: m.errorMessage,
        cost: m.cost,
        uid: m.uid,
        username: m.username,
        createdAt: m.createdAt,
      })),
      meta: {
        itemCount: items.length,
        totalItems: total,
        itemsPerPage: pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        currentPage: page,
      },
    };
  }

  async detail(id: number): Promise<MailLogEntity> {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new BusinessException(ErrorEnum.MAIL_SEND_FAILED, 'mail log not found');
    return m;
  }

  async remove(id: number): Promise<{ id: number }> {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new BusinessException(ErrorEnum.MAIL_SEND_FAILED, 'mail log not found');
    await this.repo.delete(id);
    this.logger.log(`[mail] log removed: id=${id}`);
    return { id };
  }
}

function safeParse(s: string): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
