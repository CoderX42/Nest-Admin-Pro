import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DeptEntity } from './dept.entity';
import { UserEntity } from '@/modules/system/user/user.entity';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

import { CreateDeptDto, ListDeptQueryDto, UpdateDeptDto } from './dto/dept.dto';

export interface DeptTreeNode extends DeptEntity {
  children: DeptTreeNode[];
}

@Injectable()
export class DeptService {
  private readonly logger = new Logger(DeptService.name);

  constructor(
    @InjectRepository(DeptEntity) private readonly deptRepo: Repository<DeptEntity>,
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /** 列表（支持 tree / list） */
  async list(query: ListDeptQueryDto): Promise<DeptEntity[] | DeptTreeNode[]> {
    const qb = this.deptRepo.createQueryBuilder('d').orderBy('d.sort', 'ASC').addOrderBy('d.id', 'ASC');
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere('(d.name LIKE :kw OR d.code LIKE :kw OR d.leader LIKE :kw)', { kw });
    }
    if (query.status !== undefined && query.status !== null) {
      qb.andWhere('d.status = :status', { status: query.status });
    }
    const items = await qb.getMany();
    return query.format === 'list' ? items : this.toTree(items);
  }

  /** 详情 */
  async detail(id: number): Promise<DeptEntity> {
    const dept = await this.deptRepo.findOne({ where: { id } });
    if (!dept) throw new BusinessException(ErrorEnum.DEPT_NOT_FOUND);
    return dept;
  }

  /** 创建：先插入拿到 id，再回写 path = parent.path + id + , */
  async create(dto: CreateDeptDto): Promise<DeptEntity> {
    let parentPath = ',';
    if (dto.parentId !== 0) {
      const parent = await this.deptRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) {
        throw new BusinessException(ErrorEnum.DEPT_NOT_FOUND, '父部门不存在');
      }
      parentPath = parent.path;
    }

    return await this.dataSource.transaction(async (em) => {
      const d = em.create(DeptEntity, {
        name: dto.name,
        parentId: dto.parentId,
        path: ',', // 临时占位
        code: dto.code,
        sort: dto.sort ?? 0,
        leader: dto.leader,
        phone: dto.phone,
        email: dto.email,
        status: dto.status ?? 1,
        remark: dto.remark,
      });
      const saved = await em.save(d);
      saved.path = `${parentPath}${saved.id},`;
      await em.save(saved);
      this.logger.log(`create dept: id=${saved.id} path=${saved.path}`);
      return saved;
    });
  }

  /** 更新：若 parentId 改变，级联更新所有后代 path */
  async update(id: number, dto: UpdateDeptDto): Promise<DeptEntity> {
    const dept = await this.deptRepo.findOne({ where: { id } });
    if (!dept) throw new BusinessException(ErrorEnum.DEPT_NOT_FOUND);

    if (dto.parentId !== undefined && dto.parentId !== dept.parentId) {
      if (dto.parentId === id) {
        throw new BusinessException(ErrorEnum.FAIL, '父部门不能是自己');
      }
      // 检查是否把父设成了自己的后代（防循环）
      const descendants = await this.collectDescendantIds(id);
      if (descendants.has(Number(dto.parentId))) {
        throw new BusinessException(ErrorEnum.FAIL, '父部门不能是自身的子部门');
      }
      if (dto.parentId !== 0) {
        const parent = await this.deptRepo.findOne({ where: { id: dto.parentId } });
        if (!parent) {
          throw new BusinessException(ErrorEnum.DEPT_NOT_FOUND, '父部门不存在');
        }
      }
    }

    Object.assign(dept, {
      name: dto.name ?? dept.name,
      parentId: dto.parentId ?? dept.parentId,
      code: dto.code ?? dept.code,
      sort: dto.sort ?? dept.sort,
      leader: dto.leader ?? dept.leader,
      phone: dto.phone ?? dept.phone,
      email: dto.email ?? dept.email,
      status: dto.status ?? dept.status,
      remark: dto.remark ?? dept.remark,
    });

    await this.dataSource.transaction(async (em) => {
      await em.save(dept);

      // 若 parentId 改变，级联更新 path
      if (dto.parentId !== undefined && dto.parentId !== 0) {
        const parent = await em.findOne(DeptEntity, { where: { id: dto.parentId } });
        const newBasePath = parent ? parent.path : ',';
        const oldPath = dept.path;
        const newSelfPath = `${newBasePath}${id},`;
        dept.path = newSelfPath;
        await em.save(dept);

        // 后代 path：把 oldPath 前缀换成 newSelfPath
        const descendants = await em
          .createQueryBuilder(DeptEntity, 'd')
          .where('d.path LIKE :oldPath', { oldPath: `${oldPath}%` })
          .andWhere('d.id != :id', { id })
          .getMany();
        for (const d of descendants) {
          d.path = newSelfPath + d.path.slice(oldPath.length);
          await em.save(d);
        }
      }
    });

    this.logger.log(`update dept: id=${id}`);
    return dept;
  }

  /** 删除（无子部门 + 无用户） */
  async remove(id: number): Promise<{ id: number }> {
    const dept = await this.deptRepo.findOne({ where: { id } });
    if (!dept) throw new BusinessException(ErrorEnum.DEPT_NOT_FOUND);

    const childCount = await this.deptRepo
      .createQueryBuilder('d')
      .where('d.path LIKE :path', { path: `${dept.path}%` })
      .andWhere('d.id != :id', { id })
      .getCount();
    if (childCount > 0) {
      throw new BusinessException(ErrorEnum.DEPT_HAS_CHILDREN);
    }

    const userCount = await this.userRepo.count({ where: { deptId: id } });
    if (userCount > 0) {
      throw new BusinessException(ErrorEnum.DEPT_HAS_USERS);
    }

    await this.deptRepo.delete(id);
    this.logger.log(`delete dept: id=${id}`);
    return { id };
  }

  /** 拼树 */
  private toTree(items: DeptEntity[]): DeptTreeNode[] {
    const map = new Map<number, DeptTreeNode>();
    const roots: DeptTreeNode[] = [];
    for (const d of items) {
      map.set(Number(d.id), { ...d, children: [] });
    }
    for (const node of map.values()) {
      const parentId = Number(node.parentId);
      if (parentId === 0 || !map.has(parentId)) {
        roots.push(node);
      } else {
        map.get(parentId)!.children.push(node);
      }
    }
    return roots;
  }

  /** 收集所有后代 ID（防循环） */
  private async collectDescendantIds(id: number): Promise<Set<number>> {
    const all = await this.deptRepo.find();
    const childrenMap = new Map<number, number[]>();
    for (const d of all) {
      const parentId = Number(d.parentId);
      const arr = childrenMap.get(parentId) ?? [];
      arr.push(Number(d.id));
      childrenMap.set(parentId, arr);
    }
    const result = new Set<number>();
    const stack = [Number(id)];
    while (stack.length) {
      const cur = stack.pop()!;
      const kids = childrenMap.get(cur) ?? [];
      for (const k of kids) {
        if (!result.has(k)) {
          result.add(k);
          stack.push(k);
        }
      }
    }
    return result;
  }
}
