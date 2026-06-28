import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { UserEntity } from './user.entity';
import { SysUserRoleEntity } from './user-role.entity';
import { RoleEntity } from '@/modules/system/role/role.entity';
import { encryptPassword, makeSalt } from '@/helper/md5';
import { paginate, Pagination } from '@/helper/paginate';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

import {
  AssignRolesDto,
  CreateUserDto,
  ListUserQueryDto,
  ResetPasswordDto,
  UpdateUserDto,
} from './dto/user.dto';

/** 安全用户：剥离 password / salt / pv */
export type SafeUser = Omit<UserEntity, 'password' | 'salt' | 'pv'>;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly adminRole: string;

  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SysUserRoleEntity) private readonly userRoleRepo: Repository<SysUserRoleEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepo: Repository<RoleEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {
    this.adminRole = this.config.get<string>('app.adminRole') ?? 'super_admin';
  }

  /** 通用：脱敏 */
  private toSafe(user: UserEntity): SafeUser {
    const { password, salt, pv, ...safe } = user;
    return safe as SafeUser;
  }

  /** 列表（带关键字 + 部门 + 状态过滤，带角色） */
  async list(query: ListUserQueryDto): Promise<Pagination<SafeUser & { roles: RoleEntity[] }>> {
    const qb = this.userRepo.createQueryBuilder('u').orderBy('u.id', 'DESC');

    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere(
        '(u.username LIKE :kw OR u.nickname LIKE :kw OR u.phone LIKE :kw OR u.email LIKE :kw)',
        { kw },
      );
    }
    if (query.deptId) {
      qb.andWhere('u.deptId = :deptId', { deptId: query.deptId });
    }
    if (query.status !== undefined && query.status !== null) {
      qb.andWhere('u.status = :status', { status: query.status });
    }

    const page = await paginate<UserEntity>(qb, {
      page: query.page,
      pageSize: query.pageSize,
    });

    // 二次查询：拉取所有用户的角色
    const userIds = page.items.map((u) => u.id);
    const roleMap = new Map<number, RoleEntity[]>();
    if (userIds.length) {
      const urs = await this.userRoleRepo.find({ where: userIds.map((id) => ({ userId: id })) });
      const allRoleIds = Array.from(new Set(urs.map((ur) => ur.roleId)));
      const roles = allRoleIds.length
        ? await this.roleRepo.find({ where: allRoleIds.map((rid) => ({ id: rid })) })
        : [];
      const roleById = new Map<number, RoleEntity>(roles.map((r) => [r.id, r]));
      for (const ur of urs) {
        const r = roleById.get(ur.roleId);
        if (!r) continue;
        const arr = roleMap.get(ur.userId) ?? [];
        arr.push(r);
        roleMap.set(ur.userId, arr);
      }
    }

    const items = page.items.map((u) => ({
      ...this.toSafe(u),
      roles: roleMap.get(u.id) ?? [],
    }));

    return new Pagination(items, page.meta);
  }

  /** 详情 */
  async detail(id: number): Promise<SafeUser & { roles: RoleEntity[] }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    const urs = await this.userRoleRepo.find({ where: { userId: id } });
    const roleIds = urs.map((ur) => ur.roleId);
    const roles = roleIds.length
      ? await this.roleRepo.find({ where: roleIds.map((rid) => ({ id: rid })) })
      : [];

    return { ...this.toSafe(user), roles };
  }

  /** 创建 */
  async create(dto: CreateUserDto): Promise<SafeUser> {
    const exists = await this.userRepo.findOne({ where: { username: dto.username } });
    if (exists) throw new BusinessException(ErrorEnum.USER_EXISTS);

    return await this.dataSource.transaction(async (em) => {
      // 1) 插入 user（先拿 id 才能算 salt）
      const u = em.create(UserEntity, {
        username: dto.username,
        nickname: dto.nickname,
        password: '', // 临时
        salt: '', // 临时
        email: dto.email,
        phone: dto.phone,
        deptId: dto.deptId,
        status: dto.status ?? 1,
        remark: dto.remark,
      });
      const saved = await em.save(u);

      // 2) 计算 salt + password
      const salt = makeSalt(saved.id);
      saved.salt = salt;
      saved.password = encryptPassword(dto.password, salt);
      await em.save(saved);

      // 3) 角色绑定
      if (dto.roleIds && dto.roleIds.length) {
        await this.assignRolesInTx(em, saved.id, dto.roleIds);
      }

      this.logger.log(`create user: uid=${saved.id} username=${saved.username}`);
      return this.toSafe(saved);
    });
  }

  /** 更新 */
  async update(id: number, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    Object.assign(user, {
      nickname: dto.nickname ?? user.nickname,
      email: dto.email ?? user.email,
      phone: dto.phone ?? user.phone,
      avatar: dto.avatar ?? user.avatar,
      deptId: dto.deptId ?? user.deptId,
      status: dto.status ?? user.status,
      remark: dto.remark ?? user.remark,
    });
    await this.userRepo.save(user);
    this.logger.log(`update user: uid=${id}`);
    return this.toSafe(user);
  }

  /** 删除（禁止删 uid=1 和自己） */
  async remove(id: number, currentUid: number): Promise<{ id: number }> {
    if (id === 1) throw new BusinessException(ErrorEnum.FAIL, '不允许删除超级管理员');
    if (id === currentUid) throw new BusinessException(ErrorEnum.FAIL, '不能删除自己');

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    await this.dataSource.transaction(async (em) => {
      await em.delete(SysUserRoleEntity, { userId: id });
      await em.delete(UserEntity, { id });
    });

    this.logger.log(`delete user: uid=${id}`);
    return { id };
  }

  /** 分配角色 */
  async assignRoles(id: number, dto: AssignRolesDto): Promise<{ id: number; roleIds: number[] }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    // 校验角色 ID 都存在
    if (dto.roleIds.length) {
      const roles = await this.roleRepo.find({ where: dto.roleIds.map((r) => ({ id: r })) });
      if (roles.length !== dto.roleIds.length) {
        throw new BusinessException(ErrorEnum.ROLE_NOT_FOUND);
      }
    }

    await this.dataSource.transaction(async (em) => {
      await em.delete(SysUserRoleEntity, { userId: id });
      await this.assignRolesInTx(em, id, dto.roleIds);
    });

    this.logger.log(`assign roles: uid=${id} roleIds=${JSON.stringify(dto.roleIds)}`);
    return { id, roleIds: dto.roleIds };
  }

  /** 重置密码（pv++ 令旧 token 失效） */
  async resetPassword(id: number, dto: ResetPasswordDto): Promise<{ id: number }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new BusinessException(ErrorEnum.USER_NOT_FOUND);

    user.salt = makeSalt(user.id);
    user.password = encryptPassword(dto.password, user.salt);
    user.pv = (user.pv ?? 1) + 1;
    await this.userRepo.save(user);
    this.logger.log(`reset password: uid=${id}`);
    return { id };
  }

  /** 事务内：批量插入 sys_user_role */
  private async assignRolesInTx(em: any, userId: number, roleIds: number[]) {
    if (!roleIds.length) return;
    const rows = roleIds.map((rid) => em.create(SysUserRoleEntity, { userId, roleId: rid }));
    await em.save(rows);
  }
}
