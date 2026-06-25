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
 */
export class CommonEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键 ID' })
  id: number;

  @CreateDateColumn({ type: 'datetime', precision: 0, comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 0, comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', precision: 0, nullable: true, comment: '删除时间' })
  @ApiHideProperty()
  deletedAt?: Date | null;
}
