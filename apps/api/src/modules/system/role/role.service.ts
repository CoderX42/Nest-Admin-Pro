import {
  Injectable, BadRequestException, NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async list(query: QueryRoleDto) {
    const { name, code, status, page = 1, limit = 10 } = query;
    const where: any = {};
    if (name) where.name = { contains: name };
    if (code) where.code = { contains: code };
    if (status !== undefined) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.sysRole.count({ where }),
      this.prisma.sysRole.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ]);
    return { total, items };
  }

  async findOne(id: number) {
    const role = await this.prisma.sysRole.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.sysRole.findUnique({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('Role code already exists');
    return this.prisma.sysRole.create({
      data: { name: dto.name, code: dto.code, status: 1, dataScope: dto.dataScope ?? 1 },
    });
  }

  async update(dto: UpdateRoleDto) {
    if (!dto.id) throw new BadRequestException('Role ID is required');
    const role = await this.prisma.sysRole.findUnique({ where: { id: dto.id } });
    if (!role) throw new NotFoundException('Role not found');
    return this.prisma.sysRole.update({
      where: { id: dto.id },
      data: { name: dto.name, dataScope: dto.dataScope, status: dto.status },
    });
  }

  async remove(id: number) {
    await this.prisma.sysRole.delete({ where: { id } });
    return { success: true };
  }

  async changeStatus(id: number, status: number) {
    await this.prisma.sysRole.update({ where: { id }, data: { status } });
    return { success: true };
  }

  async assignPermissions(id: number, menuIds: string[], deptIds?: string[]) {
    await this.prisma.sysRole.update({
      where: { id },
      data: {
        menuIds: JSON.stringify(menuIds),
        deptIds: deptIds ? JSON.stringify(deptIds) : null,
      },
    });
    return { success: true };
  }

  async getRoleMenus(id: number) {
    const role = await this.prisma.sysRole.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return { menuIds: JSON.parse(role.menuIds || '[]'), deptIds: JSON.parse(role.deptIds || '[]') };
  }
}