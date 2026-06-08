import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { CreateMenuDto, UpdateMenuDto, QueryMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async list(query: QueryMenuDto) {
    const { name, type, status } = query;
    const where: any = { id: { not: 0 }, deletedAt: null };
    if (name) where.name = { contains: name };
    if (type !== undefined) where.type = type;
    if (status !== undefined) where.status = status;
    const menus = await this.prisma.sysMenu.findMany({ where, orderBy: [{ sort: 'asc' }, { id: 'asc' }] });
    return this.buildTree(menus);
  }

  async tree() {
    const menus = await this.prisma.sysMenu.findMany({
      where: { id: { not: 0 }, status: 1, deletedAt: null },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
    return this.buildTree(menus);
  }

  private buildTree(menus: any[], parentId: number = 0): any[] {
    const realMenus = menus.filter((m) => Number(m.id) !== 0);
    const ids = new Set(realMenus.map((m) => Number(m.id)));
    return realMenus
      .filter((m) => Number(m.parentId) === parentId || (parentId === 0 && !ids.has(Number(m.parentId))))
      .map((m) => ({ ...m, children: this.buildTree(realMenus, Number(m.id)) }));
  }

  async buildRoute(userId: number) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: { include: { roleMenus: true } } } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const allMenuIds = new Set<number>();
    for (const userRole of user.userRoles) {
      for (const roleMenu of userRole.role.roleMenus) {
        allMenuIds.add(Number(roleMenu.menuId));
      }
    }

    const menus = await this.prisma.sysMenu.findMany({
      where: {
        id: { in: Array.from(allMenuIds).filter((id) => id !== 0).map(BigInt) },
        status: 1,
        type: { lte: 2 },
        deletedAt: null,
      },
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
        isExternal: dto.isExternal ?? 0, isCache: dto.isKeepAlive ?? 0, isVisible: dto.isVisible ?? 1,
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
        isExternal: dto.isExternal, isCache: dto.isKeepAlive, isVisible: dto.isVisible,
      },
    });
  }

  async remove(id: number) {
    const children = await this.prisma.sysMenu.count({ where: { parentId: id } });
    if (children > 0) throw new BadRequestException('Cannot delete menu with children');
    await this.prisma.sysMenu.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }
}
