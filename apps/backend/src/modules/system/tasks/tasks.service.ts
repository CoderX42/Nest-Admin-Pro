import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { TaskEntity, TaskLogEntity } from './task.entity';
import { paginate, Pagination } from '@/helper/paginate';
import { BusinessException } from '@/common/exceptions/business.exception';
import { ErrorEnum } from '@/constants/error.enum';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ListTaskQueryDto } from './dto/list-task.dto';
import { ListTaskLogQueryDto } from './dto/list-task-log.dto';
import { getMission, listMissions } from './mission/mission.types';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(TaskEntity) private readonly taskRepo: Repository<TaskEntity>,
    @InjectRepository(TaskLogEntity) private readonly logRepo: Repository<TaskLogEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ---------- 任务 CRUD ----------

  async list(query: ListTaskQueryDto): Promise<Pagination<TaskEntity>> {
    const qb = this.taskRepo.createQueryBuilder('t').orderBy('t.id', 'DESC');
    if (query.keyword) {
      const kw = `%${query.keyword}%`;
      qb.andWhere('(t.name LIKE :kw OR t.description LIKE :kw)', { kw });
    }
    if (query.type) qb.andWhere('t.type = :type', { type: query.type });
    if (query.status !== undefined) qb.andWhere('t.status = :status', { status: query.status });
    return await paginate<TaskEntity>(qb, { page: query.page, pageSize: query.pageSize });
  }

  async detail(id: number): Promise<TaskEntity> {
    const t = await this.taskRepo.findOne({ where: { id } });
    if (!t) throw new BusinessException(ErrorEnum.FAIL, `任务不存在 (id=${id})`);
    return t;
  }

  async create(dto: CreateTaskDto, currentUid: number): Promise<TaskEntity> {
    const exists = await this.taskRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new BusinessException(ErrorEnum.FAIL, `任务名已存在：${dto.name}`);

    this.validateMissionRef(dto.type, dto.service);

    const t = this.taskRepo.create({
      name: dto.name,
      description: dto.description ?? '',
      type: dto.type,
      cron: dto.cron,
      interval: dto.interval,
      service: dto.service,
      args: dto.args ?? '{}',
      status: dto.status ?? 1,
      running: 0,
      lastCost: 0,
      lastResult: 1,
      createBy: currentUid,
      updateBy: currentUid,
    });
    const saved = await this.taskRepo.save(t);
    this.logger.log(`create task: id=${saved.id} name=${saved.name} by uid=${currentUid}`);
    return saved;
  }

  async update(id: number, dto: UpdateTaskDto, currentUid: number): Promise<TaskEntity> {
    const t = await this.detail(id);

    // 若 type/service 变化需要重新校验 mission 存在性
    const nextType = dto.type ?? t.type;
    const nextService = dto.service ?? t.service ?? undefined;
    if (dto.type !== undefined || dto.service !== undefined) {
      this.validateMissionRef(nextType, nextService);
    }

    Object.assign(t, {
      description: dto.description ?? t.description,
      type: nextType,
      cron: dto.cron ?? t.cron,
      interval: dto.interval ?? t.interval,
      service: nextService ?? t.service,
      args: dto.args ?? t.args,
      updateBy: currentUid,
    });
    await this.taskRepo.save(t);
    this.logger.log(`update task: id=${id} by uid=${currentUid}`);
    return t;
  }

  async remove(id: number, currentUid: number): Promise<{ id: number }> {
    const t = await this.detail(id);
    if (t.running === 1) {
      throw new BusinessException(ErrorEnum.FAIL, '任务正在执行中，请等待完成后再删除');
    }
    await this.taskRepo.softDelete(id);
    this.logger.log(`delete task: id=${id} by uid=${currentUid}`);
    return { id };
  }

  // ---------- 状态切换 ----------

  async setStatus(id: number, status: 0 | 1, currentUid: number): Promise<TaskEntity> {
    const t = await this.detail(id);
    if (t.status === status) return t;
    t.status = status;
    t.updateBy = currentUid;
    await this.taskRepo.save(t);
    this.logger.log(`setStatus task: id=${id} status=${status} by uid=${currentUid}`);
    return t;
  }

  // ---------- 立即执行一次 ----------

  async runOnce(id: number, currentUid: number): Promise<TaskLogEntity> {
    const task = await this.detail(id);
    if (task.status !== 1) {
      throw new BusinessException(ErrorEnum.FAIL, '任务已停止，请先启用后再执行');
    }
    if (task.running === 1) {
      throw new BusinessException(ErrorEnum.FAIL, '任务正在执行中，请稍后再试');
    }
    const entry = getMission(task.service ?? '');
    if (!entry) {
      throw new BusinessException(ErrorEnum.FAIL, `未注册的 mission：${task.service}`);
    }

    // 1) 标记 running + 创建日志
    task.running = 1;
    await this.taskRepo.save(task);

    let parsedArgs: Record<string, any> = {};
    try {
      parsedArgs = task.args ? JSON.parse(task.args) : {};
    } catch (e) {
      this.logger.warn(`task ${task.name} args 解析失败，按空对象处理: ${(e as Error).message}`);
    }

    const startedAt = Date.now();
    let output: any = null;
    let error: string | null = null;
    let success = 1;
    try {
      output = await Promise.resolve(entry.handler(parsedArgs));
    } catch (e) {
      success = 0;
      error = e instanceof Error ? e.message : String(e);
    }
    const cost = Date.now() - startedAt;

    // 2) 用事务写日志 + 更新任务统计，避免半成品状态
    const result = await this.dataSource.transaction(async (em) => {
      const log = em.create(TaskLogEntity, {
        taskName: task.name,
        cost,
        status: success,
        output: output !== undefined && output !== null ? this.safeStringify(output) : null,
        error,
      });
      const savedLog = await em.save(log);

      const fresh = await em.findOne(TaskEntity, { where: { id: task.id } });
      if (fresh) {
        fresh.running = 0;
        fresh.lastRunAt = new Date(startedAt);
        fresh.lastCost = cost;
        fresh.lastResult = success;
        fresh.updateBy = currentUid;
        await em.save(fresh);
      }
      return savedLog;
    });

    this.logger.log(
      `runOnce task: id=${task.id} name=${task.name} cost=${cost}ms status=${success}`,
    );
    return result;
  }

  // ---------- 执行日志 ----------

  async logs(query: ListTaskLogQueryDto): Promise<Pagination<TaskLogEntity>> {
    const qb = this.logRepo.createQueryBuilder('l').orderBy('l.id', 'DESC');
    if (query.taskName) qb.andWhere('l.taskName = :taskName', { taskName: query.taskName });
    if (query.status !== undefined) qb.andWhere('l.status = :status', { status: query.status });
    return await paginate<TaskLogEntity>(qb, { page: query.page, pageSize: query.pageSize });
  }

  // ---------- Mission 列表（用于前端表单下拉） ----------

  async listMissions() {
    return { items: listMissions() };
  }

  // ---------- helpers ----------

  private validateMissionRef(type: string, service?: string) {
    if (type === 'mission') {
      if (!service) {
        throw new BusinessException(ErrorEnum.FAIL, 'mission 类型任务必须指定 service（mission 名）');
      }
      if (!getMission(service)) {
        throw new BusinessException(ErrorEnum.FAIL, `未注册的 mission：${service}`);
      }
    }
    if (type === 'cron' && !service) {
      throw new BusinessException(ErrorEnum.FAIL, 'cron 类型任务必须指定 service（mission 名）');
    }
  }

  private safeStringify(v: any): string {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
}
