import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { RoleEntity } from './role.entity';
import { SysRoleMenuEntity } from './role-menu.entity';
import { SysUserRoleEntity } from '@/modules/system/user/user-role.entity';
import { MenuEntity } from '@/modules/system/menu/menu.entity';
import { paginate, Pagination } from '@/helper/paginate';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

import {
  AssignMenusDto,
  CreateRoleDto,
  ListRoleQueryDto,
  UpdateRoleDto,
} from './dto/role.dto';

export type RoleWithMenus = RoleEntity & { menuIds: number[] };

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  private readonly adminRoleCode: string;

  constructor(
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(SysRoleMenuEntity) private readonly roleMenuRepo: Repository<SysRoleMenuEntity>,
    @InjectRepository(MenuEntity) private readonly menuRepo: Repository<MenuEntity>,
    @InjectRepository(SysUserRoleEntity) private readonly userRoleRepo: Repository<SysUserRoleEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {
    this.adminRoleCode = this.config.get<string>('app.adminRole') ?? 'super_admin';
  }

  /** 列表 */
  async list(query: ListRoleQueryDto): Promise<Pagination<RoleWithMenus>> {
    const qb = this.roleRepo.createQueryBuilder('r').orderBy('r.sort', 'ASC').addOrderBy('r.id', 'ASC');
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere('(r.name LIKE :kw OR r.code LIKE :kw)', { kw });
    }
    if (query.status !== undefined && query.status !== null) {
      qb.andWhere('r.status = :status', { status: query.status });
    }
    const page = await paginate<RoleEntity>(qb, { page: query.page, pageSize: query.pageSize });

    const roleIds = page.items.map((r) => r.id);
    const menuIdMap = new Map<number, number[]>();
    if (roleIds.length) {
      const rms = await this.roleMenuRepo.find({ where: roleIds.map((id) => ({ roleId: id })) });
      for (const rm of rms) {
        const arr = menuIdMap.get(rm.roleId) ?? [];
        arr.push(rm.menuId);
        menuIdMap.set(rm.roleId, arr);
      }
    }
    const items = page.items.map((r) => ({ ...r, menuIds: menuIdMap.get(r.id) ?? [] }));
    return new Pagination(items, page.meta);
  }

  /** 详情 */
  async detail(id: number): Promise<RoleWithMenus> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new BusinessException(ErrorEnum.ROLE_NOT_FOUND);
    const rms = await this.roleMenuRepo.find({ where: { roleId: id } });
    return { ...role, menuIds: rms.map((rm) => rm.menuId) };
  }

  /** 创建 */
  async create(dto: CreateRoleDto): Promise<RoleWithMenus> {
    const exists = await this.roleRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new BusinessException(ErrorEnum.ROLE_CODE_EXISTS);

    return await this.dataSource.transaction(async (em) => {
      const r = em.create(RoleEntity, {
        name: dto.name,
        code: dto.code,
        sort: dto.sort ?? 0,
        dataScope: dto.dataScope ?? 1,
        status: dto.status ?? 1,
        remark: dto.remark,
        builtin: 0,
      });
      const saved = await em.save(r);
      if (dto.menuIds && dto.menuIds.length) {
        await this.assignMenusInTx(em, saved.id, dto.menuIds);
      }
      this.logger.log(`create role: id=${saved.id} code=${saved.code}`);
      return { ...saved, menuIds: dto.menuIds ?? [] };
    });
  }

  /** 更新 */
  async update(id: number, dto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new BusinessException(ErrorEnum.ROLE_NOT_FOUND);

    Object.assign(role, {
      name: dto.name ?? role.name,
      sort: dto.sort ?? role.sort,
      dataScope: dto.dataScope ?? role.dataScope,
      status: dto.status ?? role.status,
      remark: dto.remark ?? role.remark,
    });
    await this.roleRepo.save(role);
    this.logger.log(`update role: id=${id}`);
    return role;
  }

  /** 删除（禁删内置角色 / 已被用户引用的角色） */
  async remove(id: number): Promise<{ id: number }> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new BusinessException(ErrorEnum.ROLE_NOT_FOUND);
    if (role.builtin === 1) {
      throw new BusinessException(ErrorEnum.ROLE_ROOT_FORBID_DELETE);
    }
    const refs = await this.userRoleRepo.count({ where: { roleId: id } });
    if (refs > 0) {
      throw new BusinessException(ErrorEnum.FAIL, '该角色已被用户引用，无法删除');
    }

    await this.dataSource.transaction(async (em) => {
      await em.delete(SysRoleMenuEntity, { roleId: id });
      await em.delete(RoleEntity, { id });
    });
    this.logger.log(`delete role: id=${id}`);
    return { id };
  }

  /** 分配菜单 */
  async assignMenus(id: number, dto: AssignMenusDto): Promise<{ id: number; menuIds: number[] }> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new BusinessException(ErrorEnum.ROLE_NOT_FOUND);

    if (dto.menuIds.length) {
      const menus = await this.menuRepo.find({ where: dto.menuIds.map((m) => ({ id: m })) });
      if (menus.length !== dto.menuIds.length) {
        throw new BusinessException(ErrorEnum.MENU_NOT_FOUND);
      }
    }

    await this.dataSource.transaction(async (em) => {
      await em.delete(SysRoleMenuEntity, { roleId: id });
      await this.assignMenusInTx(em, id, dto.menuIds);
    });
    this.logger.log(`assign menus: roleId=${id} menuIds=${JSON.stringify(dto.menuIds)}`);
    return { id, menuIds: dto.menuIds };
  }

  /** 事务内：批量插入 sys_role_menu */
  private async assignMenusInTx(em: any, roleId: number, menuIds: number[]) {
    if (!menuIds.length) return;
    const rows = menuIds.map((mid) => em.create(SysRoleMenuEntity, { roleId, menuId: mid }));
    await em.save(rows);
  }
}
