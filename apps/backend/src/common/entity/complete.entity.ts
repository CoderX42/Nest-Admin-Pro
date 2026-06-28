import { Column } from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CommonEntity } from './common.entity';

/**
 * 完整实体基类：扩展 createBy / updateBy 及 creator/updater 关联
 * 多租户版可继承此类再叠加 tenantId
 */
export class CompleteEntity extends CommonEntity {
  @Column({ type: 'bigint', nullable: true, comment: '创建人 ID' })
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  createBy?: number | null;

  @Column({ type: 'bigint', nullable: true, comment: '更新人 ID' })
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  updateBy?: number | null;
}
