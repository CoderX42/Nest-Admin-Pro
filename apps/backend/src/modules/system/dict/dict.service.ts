import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateDictTypeDto, UpdateDictTypeDto, QueryDictTypeDto, CreateDictDataDto, UpdateDictDataDto } from './dto/dict.dto';

@Injectable()
export class DictService {
  constructor(private prisma: PrismaService) {}

  async typeList(query: QueryDictTypeDto) {
    const { name, code, status, page = 1, limit = 10 } = query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (name) where.name = { contains: name };
    if (code) where.code = { contains: code };
    if (status !== undefined) where.status = status;
    const [total, items] = await Promise.all([
      this.prisma.sysDictType.count({ where }),
      this.prisma.sysDictType.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ]);
    return { total, items };
  }

  async typeFindOne(id: number) {
    const type = await this.prisma.sysDictType.findUnique({ where: { id }, include: { items: { orderBy: { sort: 'asc' } } } });
    if (!type) throw new NotFoundException('Dict type not found');
    return type;
  }

  async typeCreate(dto: CreateDictTypeDto) {
    return this.prisma.sysDictType.create({ data: { name: dto.name, code: dto.code, status: dto.status ?? 1, remark: dto.remark } });
  }

  async typeUpdate(dto: UpdateDictTypeDto) {
    const type = await this.prisma.sysDictType.findUnique({ where: { id: dto.id } });
    if (!type) throw new NotFoundException('Dict type not found');
    return this.prisma.sysDictType.update({ where: { id: dto.id }, data: { name: dto.name, status: dto.status, remark: dto.remark } });
  }

  async typeRemove(id: number) {
    const count = await this.prisma.sysDictData.count({ where: { dictTypeId: id } });
    if (count > 0) throw new BadRequestException('Cannot delete dict type with existing data');
    await this.prisma.sysDictType.delete({ where: { id } });
    return { success: true };
  }

  async dataList(dictTypeId: number) {
    return this.prisma.sysDictData.findMany({ where: { dictTypeId }, orderBy: { sort: 'asc' } });
  }

  async dataCreate(dto: CreateDictDataDto) {
    return this.prisma.sysDictData.create({ data: { dictTypeId: dto.dictTypeId, label: dto.label, value: dto.value, sort: dto.sort ?? 0, status: dto.status ?? 1, remark: dto.remark } });
  }

  async dataUpdate(dto: UpdateDictDataDto) {
    const data = await this.prisma.sysDictData.findUnique({ where: { id: dto.id } });
    if (!data) throw new NotFoundException('Dict data not found');
    return this.prisma.sysDictData.update({ where: { id: dto.id }, data: { label: dto.label, value: dto.value, sort: dto.sort, status: dto.status, remark: dto.remark } });
  }

  async dataRemove(id: number) {
    await this.prisma.sysDictData.delete({ where: { id } });
    return { success: true };
  }
}
