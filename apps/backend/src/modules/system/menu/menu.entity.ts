import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompleteEntity } from '@/common/entity/complete.entity';

/**
 * 菜单/权限点
 *  - type: 1=目录 2=菜单 3=按钮
 *  - perms: 权限字符串，多个用逗号分隔（前端按 perm 字符串聚合）
 */
@Entity('sys_menu')
export class MenuEntity extends CompleteEntity {
  @ApiProperty({ description: '父菜单 ID，0=根' })
  @Index()
  @Column({ type: 'bigint', default: 0, comment: '父菜单 ID' })
  parentId: number;

  @ApiProperty({ description: '菜单名称' })
  @Column({ length: 64, comment: '菜单名称' })
  name: string;

  @ApiProperty({ description: '类型 1=目录 2=菜单 3=按钮' })
  @Column({ type: 'tinyint', default: 2, comment: '类型 1=目录 2=菜单 3=按钮' })
  type: number;

  @ApiPropertyOptional({ description: '路由路径' })
  @Column({ length: 255, nullable: true, comment: '路由路径' })
  path?: string;

  @ApiPropertyOptional({ description: '前端组件' })
  @Column({ length: 255, nullable: true, comment: '前端组件' })
  component?: string;

  @ApiPropertyOptional({ description: '重定向' })
  @Column({ length: 255, nullable: true, comment: '重定向' })
  redirect?: string;

  @ApiPropertyOptional({ description: '图标' })
  @Column({ length: 64, nullable: true, comment: '图标' })
  icon?: string;

  @ApiPropertyOptional({ description: '排序' })
  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @ApiPropertyOptional({ description: '权限字符串（多个用逗号分隔）' })
  @Column({ length: 255, nullable: true, comment: '权限字符串' })
  perms?: string;

  @ApiProperty({ description: '是否隐藏' })
  @Column({ type: 'tinyint', default: 0, comment: '是否隐藏 1=是 0=否' })
  hide: number;

  @ApiProperty({ description: '是否缓存' })
  @Column({ type: 'tinyint', default: 0, comment: '是否缓存 keep-alive' })
  keepAlive: number;

  @ApiProperty({ description: '是否外链' })
  @Column({ type: 'tinyint', default: 0, comment: '是否外链' })
  external: number;

  @ApiProperty({ description: '状态 0=禁用 1=启用' })
  @Column({ type: 'tinyint', default: 1, comment: '状态 0=禁用 1=启用' })
  status: number;
}
