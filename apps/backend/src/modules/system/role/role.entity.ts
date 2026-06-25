import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompleteEntity } from '@/common/entity/complete.entity';

/**
 * 角色
 *  - code: 角色编码（如 super_admin）
 *  - builtin: true=内置角色（不可删除）
 *  - dataScope: 1=全部 2=本部门 3=本部门及下级 4=本人 5=自定义
 */
@Entity('sys_role')
export class RoleEntity extends CompleteEntity {
  @ApiProperty({ description: '角色名称' })
  @Column({ length: 64, comment: '角色名称' })
  name: string;

  @ApiProperty({ description: '角色编码（唯一）' })
  @Index({ unique: true })
  @Column({ length: 64, comment: '角色编码' })
  code: string;

  @ApiProperty({ description: '是否内置' })
  @Column({ type: 'tinyint', default: 0, comment: '是否内置 1=是 0=否' })
  builtin: number;

  @ApiPropertyOptional({ description: '排序' })
  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @ApiProperty({ description: '数据权限范围 1-5' })
  @Column({ type: 'tinyint', default: 1, comment: '数据权限 1=全部 2=本部门 3=本部门及下级 4=本人 5=自定义' })
  dataScope: number;

  @ApiProperty({ description: '状态 0=禁用 1=启用' })
  @Column({ type: 'tinyint', default: 1, comment: '状态 0=禁用 1=启用' })
  status: number;

  @ApiPropertyOptional({ description: '备注' })
  @Column({ length: 255, nullable: true, comment: '备注' })
  remark?: string;
}
