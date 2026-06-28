import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompleteEntity } from '@/common/entity/complete.entity';

/** 字典类型 */
@Entity('sys_dict_type')
export class DictTypeEntity extends CompleteEntity {
  @ApiProperty()
  @Index({ unique: true })
  @Column({ length: 64, comment: '字典类型编码' })
  code: string;

  @ApiProperty()
  @Column({ length: 64, comment: '字典名称' })
  name: string;

  @ApiPropertyOptional()
  @Column({ type: 'tinyint', default: 1, comment: '状态 0=禁用 1=启用' })
  status: number;

  @ApiPropertyOptional()
  @Column({ length: 255, nullable: true, comment: '备注' })
  remark?: string;
}

/** 字典项 */
@Entity('sys_dict_item')
export class DictItemEntity extends CompleteEntity {
  @ApiProperty()
  @Index()
  @Column({ length: 64, comment: '所属字典类型编码' })
  typeCode: string;

  @ApiProperty()
  @Column({ length: 64, comment: '字典项标签' })
  label: string;

  @ApiProperty()
  @Column({ length: 64, comment: '字典项值' })
  value: string;

  @ApiPropertyOptional()
  @Column({ length: 16, default: 'default', comment: '展示样式（default/primary/success/warning/danger）' })
  color: string;

  @ApiPropertyOptional()
  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @ApiPropertyOptional()
  @Column({ type: 'tinyint', default: 1, comment: '状态 0=禁用 1=启用' })
  status: number;

  @ApiPropertyOptional()
  @Column({ length: 255, nullable: true, comment: '备注' })
  remark?: string;
}
