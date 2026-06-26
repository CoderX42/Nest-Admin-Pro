import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ParamConfigEntity } from './param-config.entity';
import { paginate, Pagination } from '@/helper/paginate';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

import {
  CreateParamConfigDto,
  ListParamConfigQueryDto,
  UpdateParamConfigDto,
} from './dto/param-config.dto';

@Injectable()
export class ParamConfigService {
  private readonly logger = new Logger(ParamConfigService.name);

  constructor(
    @InjectRepository(ParamConfigEntity) private readonly repo: Repository<ParamConfigEntity>,
  ) {}

  async list(query: ListParamConfigQueryDto): Promise<Pagination<ParamConfigEntity>> {
    const qb = this.repo.createQueryBuilder('p').orderBy('p.id', 'ASC');
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere('(p.key LIKE :kw OR p.name LIKE :kw)', { kw });
    }
    return await paginate<ParamConfigEntity>(qb, { page: query.page, pageSize: query.pageSize });
  }

  async detail(id: number): Promise<ParamConfigEntity> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new BusinessException(ErrorEnum.PARAM_CONFIG_NOT_FOUND);
    return p;
  }

  async byKey(key: string): Promise<ParamConfigEntity> {
    const p = await this.repo.findOne({ where: { key } });
    if (!p) throw new BusinessException(ErrorEnum.PARAM_CONFIG_NOT_FOUND);
    return p;
  }

  async create(dto: CreateParamConfigDto): Promise<ParamConfigEntity> {
    const exists = await this.repo.findOne({ where: { key: dto.key } });
    if (exists) throw new BusinessException(ErrorEnum.PARAM_CONFIG_KEY_EXISTS);
    const p = this.repo.create({
      key: dto.key,
      name: dto.name,
      value: dto.value,
      valueType: dto.valueType ?? 'string',
      builtin: 0,
      remark: dto.remark,
    });
    const saved = await this.repo.save(p);
    this.logger.log(`create param: id=${saved.id} key=${saved.key}`);
    return saved;
  }

  async update(id: number, dto: UpdateParamConfigDto): Promise<ParamConfigEntity> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new BusinessException(ErrorEnum.PARAM_CONFIG_NOT_FOUND);
    Object.assign(p, {
      name: dto.name ?? p.name,
      value: dto.value ?? p.value,
      valueType: dto.valueType ?? p.valueType,
      remark: dto.remark ?? p.remark,
    });
    await this.repo.save(p);
    this.logger.log(`update param: id=${id}`);
    return p;
  }

  async remove(id: number): Promise<{ id: number }> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new BusinessException(ErrorEnum.PARAM_CONFIG_NOT_FOUND);
    if (p.builtin === 1) {
      throw new BusinessException(ErrorEnum.FAIL, '内置参数不可删除');
    }
    await this.repo.delete(id);
    this.logger.log(`delete param: id=${id}`);
    return { id };
  }
}
