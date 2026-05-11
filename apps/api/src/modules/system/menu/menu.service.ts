import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateMenuDto, UpdateMenuDto, QueryMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async list(query: QueryMenuDto) {
    const { name, type, status } = query;
    const where: any = {};
    if (name) where.name = { contains: name };
    if (type !== undefined) where.type = type;
    if (status !== undefined) where.status = status;
    return this.prisma.sysMenu.findMany({ where, orderBy: [{ sort: 'asc' }, { id: 'asc' }] });
  }

  async tree() {
    const menus = await this.prisma.sysMenu.findMany({
      where: { status: 1 },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
    return this.buildTree(menus);
  }

  private buildTree(menus: any[], parentId = 0): any[] {
    return menus
      .filter((m) => m.parentId === parentId)
      .map((m) => ({ ...m, children: this.buildTree(menus, m.id) }));
  }

  async buildRoute(userId: number) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const allMenuIds = new Set<number>();
    for (const role of user.roles) {
      try {
        const ids = JSON.parse(role.menuIds || '[]');
        ids.forEach((id: number) => allMenuIds.add(id));
      } catch {}
    }

    const menus = await this.prisma.sysMenu.findMany({
      where: { id: { in: Array.from(allMenuIds) }, status: 1, type: { lte: 2 } },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });

    return this.buildTree(menus);
  }

  async findOne(id: number) {
    const menu = await this.prisma.sysMenu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async create(dto: CreateMenuDto) {
    return this.prisma.sysMenu.create({
      data: {
        name: dto.name, type: dto.type ?? 1, parentId: dto.parentId ?? 0,
        path: dto.path, component: dto.component, icon: dto.icon,
        sort: dto.sort ?? 0, perms: dto.perms, status: dto.status ?? 1,
        external: dto.external ?? 0, keepAlive: dto.keepAlive ?? 0, show: dto.show ?? 1,
      },
    });
  }

  async update(dto: UpdateMenuDto) {
    const menu = await this.prisma.sysMenu.findUnique({ where: { id: dto.id } });
    if (!menu) throw new NotFoundException('Menu not found');
    return this.prisma.sysMenu.update({
      where: { id: dto.id },
      data: {
        name: dto.name, type: dto.type, parentId: dto.parentId,
        path: dto.path, component: dto.component, icon: dto.icon,
        sort: dto.sort, perms: dto.perms, status: dto.status,
        external: dto.external, keepAlive: dto.keepAlive, show: dto.show,
      },
    });
  }

  async remove(id: number) {
    const children = await this.prisma.sysMenu.count({ where: { parentId: id } });
    if (children > 0) throw new Error('Cannot delete menu with children');
    await this.prisma.sysMenu.delete({ where: { id } });
    return { success: true };
  }
}