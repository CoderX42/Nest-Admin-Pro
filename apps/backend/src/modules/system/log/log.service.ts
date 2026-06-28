
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginLogEntity, OperLogEntity } from './log.entity';
import { paginate, Pagination } from '@/helper/paginate';
import { parseUA } from '@/helper/ua-parser';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

export interface RecordLoginLogInput {
  uid?: number;
  username: string;
  ip?: string;
  ua?: string;
  status: 0 | 1;
  message?: string;
}

export interface ListLoginLogQuery {
  page?: number;
  pageSize?: number;
  username?: string;
  status?: number;
}

export interface ListOperLogQuery {
  page?: number;
  pageSize?: number;
  module?: string;
  username?: string;
  status?: number;
}

@Injectable()
export class LoginLogService {
  private readonly logger = new Logger(LoginLogService.name);

  constructor(
    @InjectRepository(LoginLogEntity) private readonly repo: Repository<LoginLogEntity>,
  ) {}

  async record(input: RecordLoginLogInput): Promise<void> {
    try {
      const parsed = parseUA(input.ua);
      await this.repo.insert({
        uid: input.uid ?? 0,
        username: input.username,
        ip: input.ip ?? '',
        ua: (input.ua ?? '').slice(0, 512),
        browser: parsed.browser,
        os: parsed.os,
        status: input.status,
        message: input.message ?? (input.status === 1 ? '登录成功' : '登录失败'),
      });
    } catch (e) {
      this.logger.warn(`[login-log] record failed: ${(e as Error).message}`);
    }
  }

  async list(query: ListLoginLogQuery): Promise<Pagination<LoginLogEntity>> {
    const qb = this.repo.createQueryBuilder('l').orderBy('l.id', 'DESC');
    if (query.username) {
      qb.andWhere('l.username LIKE :u', { u: `%${query.username}%` });
    }
    if (query.status !== undefined) {
      qb.andWhere('l.status = :s', { s: query.status });
    }
    return await paginate<LoginLogEntity>(qb, { page: query.page, pageSize: query.pageSize });
  }

  async remove(id: number): Promise<{ id: number }> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new BusinessException(ErrorEnum.LOGIN_LOG_NOT_FOUND);
    await this.repo.delete(id);
    return { id };
  }

  async clear(): Promise<{ deleted: number }> {
    const res = await this.repo.createQueryBuilder().delete().execute();
    return { deleted: res.affected ?? 0 };
  }
}

@Injectable()
export class OperLogService {
  private readonly logger = new Logger(OperLogService.name);

  constructor(
    @InjectRepository(OperLogEntity) private readonly repo: Repository<OperLogEntity>,
  ) {}

  async record(input: Partial<OperLogEntity>): Promise<void> {
    try {
      await this.repo.insert({
        uid: input.uid ?? 0,
        username: input.username ?? '',
        module: input.module ?? 'unknown',
        action: input.action ?? '',
        url: input.url,
        method: input.method,
        params: input.params,
        result: input.result,
        cost: input.cost ?? 0,
        status: input.status ?? 1,
        ip: input.ip,
      });
    } catch (e) {
      this.logger.warn(`[oper-log] record failed: ${(e as Error).message}`);
    }
  }

  async list(query: ListOperLogQuery): Promise<Pagination<OperLogEntity>> {
    const qb = this.repo.createQueryBuilder('o').orderBy('o.id', 'DESC');
    if (query.module) {
      qb.andWhere('o.module LIKE :m', { m: `%${query.module}%` });
    }
    if (query.username) {
      qb.andWhere('o.username LIKE :u', { u: `%${query.username}%` });
    }
    if (query.status !== undefined) {
      qb.andWhere('o.status = :s', { s: query.status });
    }
    return await paginate<OperLogEntity>(qb, { page: query.page, pageSize: query.pageSize });
  }

  async remove(id: number): Promise<{ id: number }> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new BusinessException(ErrorEnum.OPER_LOG_NOT_FOUND);
    await this.repo.delete(id);
    return { id };
  }

  async clear(): Promise<{ deleted: number }> {
    const res = await this.repo.createQueryBuilder().delete().execute();
    return { deleted: res.affected ?? 0 };
  }
}
