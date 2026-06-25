import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompleteEntity } from '@/common/entity/complete.entity';

/**
 * 部门（Materialized-Path 树形结构）
 *  - parentId: 父节点 ID，0 表示根
 *  - path: 物化路径，形如 ",1,4,7,"，便于一次性查出整棵子树
 */
@Entity('sys_dept')
export class DeptEntity extends CompleteEntity {
  @ApiProperty({ description: '部门名称' })
  @Column({ length: 64, comment: '部门名称' })
  name: string;

  @ApiProperty({ description: '父部门 ID，0=根' })
  @Index()
  @Column({ type: 'bigint', default: 0, comment: '父部门 ID' })
  parentId: number;

  @ApiProperty({ description: '物化路径，形如 ,1,4,' })
  @Index()
  @Column({ length: 255, default: ',', comment: '物化路径' })
  path: string;

  @ApiPropertyOptional({ description: '部门编码' })
  @Column({ length: 64, nullable: true, comment: '部门编码' })
  code?: string;

  @ApiPropertyOptional({ description: '排序' })
  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @ApiPropertyOptional({ description: '负责人' })
  @Column({ length: 64, nullable: true, comment: '负责人' })
  leader?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @Column({ length: 32, nullable: true, comment: '联系电话' })
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @Column({ length: 128, nullable: true, comment: '邮箱' })
  email?: string;

  @ApiProperty({ description: '状态 0=禁用 1=启用' })
  @Column({ type: 'tinyint', default: 1, comment: '状态 0=禁用 1=启用' })
  status: number;

  @ApiPropertyOptional({ description: '备注' })
  @Column({ length: 255, nullable: true, comment: '备注' })
  remark?: string;
}
