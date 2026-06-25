import { Column, Entity, Index } from 'typeorm';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { CompleteEntity } from '@/common/entity/complete.entity';

@Entity('sys_user')
export class UserEntity extends CompleteEntity {
  @ApiProperty({ description: '账号' })
  @Index({ unique: true })
  @Column({ length: 64, comment: '账号' })
  username: string;

  @ApiProperty({ description: '昵称' })
  @Column({ length: 64, default: '', comment: '昵称' })
  nickname: string;

  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  @Column({ length: 128, comment: '密码（md5(md5+pw+salt)）' })
  password: string;

  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  @Column({ length: 32, comment: '盐' })
  salt: string;

  @ApiHideProperty()
  @Column({ type: 'int', default: 1, comment: '密码版本（修改密码时 +1 令旧 token 失效）' })
  pv: number;

  @ApiPropertyOptional({ description: '邮箱' })
  @Index()
  @Column({ length: 128, nullable: true, comment: '邮箱' })
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @Column({ length: 32, nullable: true, comment: '手机号' })
  phone?: string;

  @ApiPropertyOptional({ description: '头像' })
  @Column({ length: 255, nullable: true, comment: '头像' })
  avatar?: string;

  @ApiPropertyOptional({ description: '所属部门 ID' })
  @Index()
  @Column({ type: 'bigint', nullable: true, comment: '所属部门 ID' })
  deptId?: number;

  @ApiProperty({ description: '状态 0=禁用 1=启用' })
  @Column({ type: 'tinyint', default: 1, comment: '状态 0=禁用 1=启用' })
  status: number;

  @ApiHideProperty()
  @Column({ type: 'datetime', nullable: true, comment: '最后登录时间' })
  lastLoginAt?: Date;

  @ApiHideProperty()
  @Column({ length: 64, nullable: true, comment: '最后登录 IP' })
  lastLoginIp?: string;

  @ApiPropertyOptional({ description: '备注' })
  @Column({ length: 255, nullable: true, comment: '备注' })
  remark?: string;

  /** 角色集合（由 SysUserRole 关联注入） */
  roles?: any[];
}
