import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';

/** 用户-角色关联表 */
@Entity('sys_user_role')
@Index(['userId', 'roleId'], { unique: true })
export class SysUserRoleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @ApiHideProperty()
  id: number;

  @Column({ type: 'bigint', comment: '用户 ID' })
  @ApiHideProperty()
  userId: number;

  @Column({ type: 'bigint', comment: '角色 ID' })
  @ApiHideProperty()
  roleId: number;

  @Column({ type: 'datetime', precision: 0, default: () => 'CURRENT_TIMESTAMP', comment: '创建时间' })
  @ApiHideProperty()
  createdAt: Date;
}
