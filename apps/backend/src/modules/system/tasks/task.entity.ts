import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommonEntity } from '@/common/entity/common.entity';
import { CompleteEntity } from '@/common/entity/complete.entity';

/** 任务 */
@Entity('sys_task')
export class TaskEntity extends CompleteEntity {
  @ApiProperty()
  @Index({ unique: true })
  @Column({ length: 64, comment: '任务唯一名（@Mission 装饰器 name）' })
  name: string;

  @ApiProperty()
  @Column({ length: 255, default: '', comment: '任务描述' })
  description: string;

  @ApiProperty()
  @Column({ length: 16, default: 'cron', comment: '类型 cron/interval/mission' })
  type: string;

  @ApiPropertyOptional()
  @Column({ length: 64, nullable: true, comment: 'cron 表达式' })
  cron?: string;

  @ApiPropertyOptional()
  @Column({ type: 'int', nullable: true, comment: 'interval 间隔 ms' })
  interval?: number;

  @ApiPropertyOptional()
  @Column({ length: 255, nullable: true, comment: '调用服务（service.method）' })
  service?: string;

  @ApiPropertyOptional()
  @Column({ length: 128, default: '{}', comment: '参数（JSON）' })
  args: string;

  @ApiProperty()
  @Column({ type: 'tinyint', default: 1, comment: '状态 0=停止 1=运行' })
  status: number;

  @ApiProperty()
  @Column({ type: 'tinyint', default: 0, comment: '执行中 1/0' })
  running: number;

  @ApiPropertyOptional()
  @Column({ type: 'datetime', nullable: true, comment: '上次执行时间' })
  lastRunAt?: Date;

  @ApiPropertyOptional()
  @Column({ type: 'int', default: 0, comment: '上次耗时 ms' })
  lastCost: number;

  @ApiPropertyOptional()
  @Column({ type: 'tinyint', default: 1, comment: '上次结果 1=成功 0=失败' })
  lastResult: number;
}

/** 任务执行日志 */
@Entity('sys_task_log')
export class TaskLogEntity extends CommonEntity {
  @ApiProperty()
  @Index()
  @Column({ length: 64, comment: '任务名' })
  taskName: string;

  @ApiProperty()
  @Column({ type: 'int', default: 0, comment: '耗时 ms' })
  cost: number;

  @ApiProperty()
  @Column({ type: 'tinyint', default: 1, comment: '1=成功 0=失败' })
  status: number;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true, comment: '输出' })
  output?: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  error?: string;
}
