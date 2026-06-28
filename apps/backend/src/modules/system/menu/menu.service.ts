import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MenuEntity } from './menu.entity';
import { SysRoleMenuEntity } from '@/modules/system/role/role-menu.entity';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

import { CreateMenuDto, ListMenuQueryDto, UpdateMenuDto } from './dto/menu.dto';

export interface MenuTreeNode extends MenuEntity {
  children: MenuTreeNode[];
}

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(
    @InjectRepository(MenuEntity) private readonly menuRepo: Repository<MenuEntity>,
    @InjectRepository(SysRoleMenuEntity) private readonly roleMenuRepo: Repository<SysRoleMenuEntity>,
  ) {}

  /** 列表（支持 tree / list） */
  async list(query: ListMenuQueryDto): Promise<MenuEntity[] | MenuTreeNode[]> {
    const qb = this.menuRepo.createQueryBuilder('m').orderBy('m.sort', 'ASC').addOrderBy('m.id', 'ASC');
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere('(m.name LIKE :kw OR m.path LIKE :kw OR m.perms LIKE :kw)', { kw });
    }
    if (query.status !== undefined && query.status !== null) {
      qb.andWhere('m.status = :status', { status: query.status });
    }
    const items = await qb.getMany();
    return query.format === 'list' ? items : this.toTree(items);
  }

  /** 详情 */
  async detail(id: number): Promise<MenuEntity> {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new BusinessException(ErrorEnum.MENU_NOT_FOUND);
    return menu;
  }

  /** 创建 */
  async create(dto: CreateMenuDto): Promise<MenuEntity> {
    if (dto.parentId !== 0) {
      const parent = await this.menuRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new BusinessException(ErrorEnum.MENU_NOT_FOUND, '父菜单不存在');
    }
    const m = this.menuRepo.create({
      parentId: dto.parentId,
      name: dto.name,
      type: dto.type,
      path: dto.path,
      component: dto.component,
      redirect: dto.redirect,
      icon: dto.icon,
      sort: dto.sort ?? 0,
      perms: dto.perms,
      hide: dto.hide ?? 0,
      keepAlive: dto.keepAlive ?? 0,
      external: dto.external ?? 0,
      status: dto.status ?? 1,
    });
    const saved = await this.menuRepo.save(m);
    this.logger.log(`create menu: id=${saved.id} name=${saved.name}`);
    return saved;
  }

  /** 更新 */
  async update(id: number, dto: UpdateMenuDto): Promise<MenuEntity> {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new BusinessException(ErrorEnum.MENU_NOT_FOUND);

    if (dto.parentId !== undefined && dto.parentId !== 0) {
      if (dto.parentId === id) {
        throw new BusinessException(ErrorEnum.FAIL, '父菜单不能是自己');
      }
      const parent = await this.menuRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new BusinessException(ErrorEnum.MENU_NOT_FOUND, '父菜单不存在');
      // 防止循环：检查 dto.parentId 是否是当前菜单的后代
      const descendants = await this.collectDescendantIds(id);
      if (descendants.has(dto.parentId)) {
        throw new BusinessException(ErrorEnum.FAIL, '父菜单不能是自身的子菜单');
      }
    }

    Object.assign(menu, {
      parentId: dto.parentId ?? menu.parentId,
      name: dto.name ?? menu.name,
      type: dto.type ?? menu.type,
      path: dto.path ?? menu.path,
      component: dto.component ?? menu.component,
      redirect: dto.redirect ?? menu.redirect,
      icon: dto.icon ?? menu.icon,
      sort: dto.sort ?? menu.sort,
      perms: dto.perms ?? menu.perms,
      hide: dto.hide ?? menu.hide,
      keepAlive: dto.keepAlive ?? menu.keepAlive,
      external: dto.external ?? menu.external,
      status: dto.status ?? menu.status,
    });
    await this.menuRepo.save(menu);
    this.logger.log(`update menu: id=${id}`);
    return menu;
  }

  /** 删除（无子菜单 + 无角色引用） */
  async remove(id: number): Promise<{ id: number }> {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new BusinessException(ErrorEnum.MENU_NOT_FOUND);

    const childCount = await this.menuRepo.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BusinessException(ErrorEnum.MENU_HAS_CHILDREN);
    }
    const refs = await this.roleMenuRepo.count({ where: { menuId: id } });
    if (refs > 0) {
      throw new BusinessException(ErrorEnum.FAIL, '该菜单已被角色引用，无法删除');
    }

    await this.menuRepo.delete(id);
    this.logger.log(`delete menu: id=${id}`);
    return { id };
  }

  /** 拼树 */
  private toTree(items: MenuEntity[]): MenuTreeNode[] {
    const map = new Map<number, MenuTreeNode>();
    const roots: MenuTreeNode[] = [];
    for (const m of items) {
      map.set(m.id, { ...m, children: [] });
    }
    for (const node of map.values()) {
      if (node.parentId === 0 || !map.has(node.parentId)) {
        roots.push(node);
      } else {
        map.get(node.parentId)!.children.push(node);
      }
    }
    return roots;
  }

  /** 收集所有后代 ID（防循环） */
  private async collectDescendantIds(id: number): Promise<Set<number>> {
    const all = await this.menuRepo.find();
    const childrenMap = new Map<number, number[]>();
    for (const m of all) {
      // bigint 字段在 JS 中可能序列化为 string，统一 Number() 归一化
      const parentId = Number(m.parentId);
      const mid = Number(m.id);
      const arr = childrenMap.get(parentId) ?? [];
      arr.push(m.id);
      childrenMap.set(parentId, arr);
    }
    const result = new Set<number>();
    const stack = [Number(id)];
    while (stack.length) {
      const cur = stack.pop()!;
      const kids = childrenMap.get(cur) ?? [];
      for (const k of kids.map(Number)) {
        if (!result.has(k)) {
          result.add(k);
          stack.push(k);
        }
      }
    }
    return result;
  }
}
