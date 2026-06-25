import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';

/**
 * 基础实体：id + 创建/更新时间 + 软删除
 * 所有业务实体继承此类
 *
 * 注意：MySQL 8 严格模式下，datetime(N) 必须与 DEFAULT CURRENT_TIMESTAMP(N) 精度一致，
 * 因此这里使用 precision: 6 与 TypeORM 内置默认对齐。
 */
export class CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键 ID' })
  id: number;

  @CreateDateColumn({ type: 'datetime', precision: 6, comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6, comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', precision: 6, nullable: true, comment: '删除时间' })
  @ApiHideProperty()
  deletedAt?: Date | null;
}
