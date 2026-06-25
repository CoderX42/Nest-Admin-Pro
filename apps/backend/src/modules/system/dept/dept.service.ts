import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateDeptDto, UpdateDeptDto, QueryDeptDto } from './dto/dept.dto';

@Injectable()
export class DeptService {
  constructor(private prisma: PrismaService) {}

  async list(query: QueryDeptDto) {
    const { name, status } = query;
    const where: any = {};
    if (name) where.name = { contains: name };
    if (status !== undefined) where.status = status;
    const depts = await this.prisma.sysDept.findMany({
      where,
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
    return this.buildTree(depts);
  }

  async tree() {
    const depts = await this.prisma.sysDept.findMany({
      where: { status: 1 },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
    return this.buildTree(depts);
  }

  private buildTree(items: any[], parentId = 0): any[] {
    return items
      .filter((d) => Number(d.parentId) === parentId)
      .map((d) => ({
        ...d,
        children: this.buildTree(items, Number(d.id)),
      }));
  }

  async findOne(id: number) {
    const dept = await this.prisma.sysDept.findUnique({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(dto: CreateDeptDto) {
    return this.prisma.sysDept.create({
      data: {
        name: dto.name,
        parentId: dto.parentId ?? 0,
        sort: dto.sort ?? 0,
        status: dto.status ?? 1,
        leaderId: dto.leaderId,
      },
    });
  }

  async update(dto: UpdateDeptDto) {
    const dept = await this.prisma.sysDept.findUnique({ where: { id: dto.id } });
    if (!dept) throw new NotFoundException('Department not found');
    return this.prisma.sysDept.update({
      where: { id: dto.id },
      data: { name: dto.name, parentId: dto.parentId, sort: dto.sort, status: dto.status, leaderId: dto.leaderId },
    });
  }

  async remove(id: number) {
    const children = await this.prisma.sysDept.count({ where: { parentId: id } });
    if (children > 0) throw new Error('Cannot delete department with children');
    await this.prisma.sysDept.delete({ where: { id } });
    return { success: true };
  }
}
