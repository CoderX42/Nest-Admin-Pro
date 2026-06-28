import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';

/** 角色-菜单关联表 */
@Entity('sys_role_menu')
@Index(['roleId', 'menuId'], { unique: true })
export class SysRoleMenuEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @ApiHideProperty()
  id: number;

  @Column({ type: 'bigint', comment: '角色 ID' })
  @ApiHideProperty()
  roleId: number;

  @Column({ type: 'bigint', comment: '菜单 ID' })
  @ApiHideProperty()
  menuId: number;

  @Column({ type: 'datetime', precision: 0, default: () => 'CURRENT_TIMESTAMP', comment: '创建时间' })
  @ApiHideProperty()
  createdAt: Date;
}
