import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DictTypeEntity, DictItemEntity } from './dict.entity';
import { paginate, Pagination } from '@/helper/paginate';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

import {
  CreateDictItemDto,
  CreateDictTypeDto,
  ListDictItemQueryDto,
  ListDictTypeQueryDto,
  UpdateDictItemDto,
  UpdateDictTypeDto,
} from './dto/dict.dto';

@Injectable()
export class DictService {
  private readonly logger = new Logger(DictService.name);

  constructor(
    @InjectRepository(DictTypeEntity) private readonly typeRepo: Repository<DictTypeEntity>,
    @InjectRepository(DictItemEntity) private readonly itemRepo: Repository<DictItemEntity>,
  ) {}

  // ===== DictType =====

  async listTypes(query: ListDictTypeQueryDto): Promise<Pagination<DictTypeEntity>> {
    const qb = this.typeRepo.createQueryBuilder('t').orderBy('t.id', 'ASC');
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere('(t.name LIKE :kw OR t.code LIKE :kw)', { kw });
    }
    if (query.status !== undefined && query.status !== null) {
      qb.andWhere('t.status = :status', { status: query.status });
    }
    return await paginate<DictTypeEntity>(qb, { page: query.page, pageSize: query.pageSize });
  }

  async allTypes(): Promise<Pick<DictTypeEntity, 'id' | 'code' | 'name'>[]> {
    const list = await this.typeRepo.find({ order: { id: 'ASC' } });
    return list.map((t) => ({ id: t.id, code: t.code, name: t.name }));
  }

  async detailType(id: number): Promise<DictTypeEntity> {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new BusinessException(ErrorEnum.DICT_TYPE_NOT_FOUND);
    return t;
  }

  async createType(dto: CreateDictTypeDto): Promise<DictTypeEntity> {
    const exists = await this.typeRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new BusinessException(ErrorEnum.DICT_TYPE_EXISTS);
    const t = this.typeRepo.create({
      code: dto.code,
      name: dto.name,
      status: dto.status ?? 1,
      remark: dto.remark,
    });
    const saved = await this.typeRepo.save(t);
    this.logger.log(`create dictType: id=${saved.id} code=${saved.code}`);
    return saved;
  }

  async updateType(id: number, dto: UpdateDictTypeDto): Promise<DictTypeEntity> {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new BusinessException(ErrorEnum.DICT_TYPE_NOT_FOUND);
    Object.assign(t, {
      name: dto.name ?? t.name,
      status: dto.status ?? t.status,
      remark: dto.remark ?? t.remark,
    });
    await this.typeRepo.save(t);
    this.logger.log(`update dictType: id=${id}`);
    return t;
  }

  async removeType(id: number): Promise<{ id: number }> {
    const t = await this.typeRepo.findOne({ where: { id } });
    if (!t) throw new BusinessException(ErrorEnum.DICT_TYPE_NOT_FOUND);
    const refs = await this.itemRepo.count({ where: { typeCode: t.code } });
    if (refs > 0) {
      throw new BusinessException(ErrorEnum.FAIL, '该字典类型下存在字典项，无法删除');
    }
    await this.typeRepo.delete(id);
    this.logger.log(`delete dictType: id=${id}`);
    return { id };
  }

  // ===== DictItem =====

  async listItems(query: ListDictItemQueryDto): Promise<DictItemEntity[]> {
    const qb = this.itemRepo
      .createQueryBuilder('i')
      .where('i.typeCode = :typeCode', { typeCode: query.typeCode })
      .orderBy('i.sort', 'ASC')
      .addOrderBy('i.id', 'ASC');
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere('(i.label LIKE :kw OR i.value LIKE :kw)', { kw });
    }
    if (query.status !== undefined && query.status !== null) {
      qb.andWhere('i.status = :status', { status: query.status });
    }
    return await qb.getMany();
  }

  /** 前端 select 用：按 typeCode 取所有启用项 */
  async itemsByTypeCode(typeCode: string): Promise<DictItemEntity[]> {
    const t = await this.typeRepo.findOne({ where: { code: typeCode } });
    if (!t) throw new BusinessException(ErrorEnum.DICT_TYPE_NOT_FOUND);
    return await this.itemRepo.find({
      where: { typeCode, status: 1 },
      order: { sort: 'ASC', id: 'ASC' },
    });
  }

  async detailItem(id: number): Promise<DictItemEntity> {
    const i = await this.itemRepo.findOne({ where: { id } });
    if (!i) throw new BusinessException(ErrorEnum.FAIL, '字典项不存在');
    return i;
  }

  async createItem(dto: CreateDictItemDto): Promise<DictItemEntity> {
    const t = await this.typeRepo.findOne({ where: { code: dto.typeCode } });
    if (!t) throw new BusinessException(ErrorEnum.DICT_TYPE_NOT_FOUND, '所属字典类型不存在');
    const i = this.itemRepo.create({
      typeCode: dto.typeCode,
      label: dto.label,
      value: dto.value,
      color: dto.color ?? 'default',
      sort: dto.sort ?? 0,
      status: dto.status ?? 1,
      remark: dto.remark,
    });
    const saved = await this.itemRepo.save(i);
    this.logger.log(`create dictItem: id=${saved.id} typeCode=${saved.typeCode}`);
    return saved;
  }

  async updateItem(id: number, dto: UpdateDictItemDto): Promise<DictItemEntity> {
    const i = await this.itemRepo.findOne({ where: { id } });
    if (!i) throw new BusinessException(ErrorEnum.FAIL, '字典项不存在');
    Object.assign(i, {
      label: dto.label ?? i.label,
      value: dto.value ?? i.value,
      color: dto.color ?? i.color,
      sort: dto.sort ?? i.sort,
      status: dto.status ?? i.status,
      remark: dto.remark ?? i.remark,
    });
    await this.itemRepo.save(i);
    this.logger.log(`update dictItem: id=${id}`);
    return i;
  }

  async removeItem(id: number): Promise<{ id: number }> {
    const i = await this.itemRepo.findOne({ where: { id } });
    if (!i) throw new BusinessException(ErrorEnum.FAIL, '字典项不存在');
    await this.itemRepo.delete(id);
    this.logger.log(`delete dictItem: id=${id}`);
    return { id };
  }
}
