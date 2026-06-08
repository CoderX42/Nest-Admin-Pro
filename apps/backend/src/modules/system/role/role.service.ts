import {
  Injectable, BadRequestException, NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateRoleDto, UpdateRoleDto, QueryRoleDto, SetDataScopeDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async list(query: QueryRoleDto) {
    const { name, code, status, page = 1, limit = 10 } = query;
    const where: any = { deletedAt: null };
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
    const role = await this.prisma.sysRole.findFirst({ where: { id, deletedAt: null } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.sysRole.findFirst({
      where: { code: dto.code, tenantId: null, deletedAt: null },
    });
    if (existing) throw new BadRequestException('Role code already exists');
    return this.prisma.sysRole.create({
      data: {
        tenantId: null,
        name: dto.name,
        code: dto.code,
        sort: dto.sort ?? 0,
        status: dto.status ?? 1,
        dataScope: dto.dataScope ?? 1,
      },
    });
  }

  async update(dto: UpdateRoleDto) {
    if (!dto.id) throw new BadRequestException('Role ID is required');
    const role = await this.prisma.sysRole.findFirst({ where: { id: dto.id, deletedAt: null } });
    if (!role) throw new NotFoundException('Role not found');
    if (dto.code && dto.code !== role.code) {
      const existing = await this.prisma.sysRole.findFirst({
        where: { code: dto.code, tenantId: null, deletedAt: null },
      });
      if (existing) throw new BadRequestException('Role code already exists');
    }
    return this.prisma.sysRole.update({
      where: { id: dto.id },
      data: { name: dto.name, code: dto.code, sort: dto.sort, dataScope: dto.dataScope, status: dto.status },
    });
  }

  async remove(id: number) {
    await this.prisma.sysRole.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  async changeStatus(id: number, status: number) {
    await this.prisma.sysRole.update({ where: { id }, data: { status } });
    return { success: true };
  }

  async assignPermissions(id: number, menuIds: string[], deptIds?: string[]) {
    await this.prisma.$transaction([
      this.prisma.sysRoleMenu.deleteMany({ where: { roleId: BigInt(id) } }),
      this.prisma.sysRoleDept.deleteMany({ where: { roleId: BigInt(id) } }),
      this.prisma.sysRoleMenu.createMany({
        data: menuIds.map((menuId) => ({ roleId: BigInt(id), menuId: BigInt(menuId) })),
      }),
      this.prisma.sysRoleDept.createMany({
        data: (deptIds ?? []).map((deptId) => ({ roleId: BigInt(id), deptId: BigInt(deptId) })),
      }),
    ]);
    return { success: true };
  }

  async setDataScope(id: number, dto: SetDataScopeDto) {
    if (![1, 2, 3, 4, 5].includes(dto.dataScope)) {
      throw new BadRequestException('Invalid data scope');
    }
    if (dto.dataScope === 2 && !dto.deptIds?.length) {
      throw new BadRequestException('Custom data scope requires deptIds');
    }
    await this.findOne(id);
    const operations = [
      this.prisma.sysRole.update({
        where: { id },
        data: { dataScope: dto.dataScope },
      }),
      this.prisma.sysRoleDept.deleteMany({ where: { roleId: BigInt(id) } }),
    ];
    if (dto.dataScope === 2) {
      operations.push(this.prisma.sysRoleDept.createMany({
        data: dto.dataScope === 2
          ? (dto.deptIds ?? []).map((deptId) => ({ roleId: BigInt(id), deptId: BigInt(deptId) }))
          : [],
      }));
    }
    await this.prisma.$transaction(operations);
    return { success: true };
  }

  async getRoleMenus(id: number) {
    const role = await this.prisma.sysRole.findUnique({
      where: { id },
      include: { roleMenus: true, roleDepts: true },
    });
    if (!role) throw new NotFoundException('Role not found');
    return {
      menuIds: role.roleMenus.map((roleMenu) => String(roleMenu.menuId)),
      deptIds: role.roleDepts.map((roleDept) => String(roleDept.deptId)),
    };
  }
}
