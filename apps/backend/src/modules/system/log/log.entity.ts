import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CommonEntity } from '@/common/entity/common.entity';

/** 登录日志 */
@Entity('sys_login_log')
export class LoginLogEntity extends CommonEntity {
  @ApiProperty()
  @Index()
  @Column({ type: 'bigint', comment: '用户 ID' })
  uid: number;

  @ApiProperty()
  @Column({ length: 64, default: '', comment: '账号' })
  username: string;

  @ApiProperty()
  @Column({ length: 64, nullable: true, comment: 'IP 归属地' })
  address?: string;

  @ApiProperty()
  @Column({ length: 64, nullable: true, comment: '登录 IP' })
  ip?: string;

  @ApiProperty()
  @Column({ length: 512, nullable: true, comment: 'User-Agent' })
  ua?: string;

  @ApiProperty()
  @Column({ length: 64, nullable: true, comment: '浏览器' })
  browser?: string;

  @ApiProperty()
  @Column({ length: 64, nullable: true, comment: '操作系统' })
  os?: string;

  @ApiProperty()
  @Column({ type: 'tinyint', comment: '状态 1=成功 0=失败' })
  status: number;

  @ApiProperty()
  @Column({ length: 255, default: '', comment: '消息' })
  message: string;
}

/** 操作日志 */
@Entity('sys_oper_log')
export class OperLogEntity extends CommonEntity {
  @ApiProperty()
  @Index()
  @Column({ type: 'bigint', comment: '操作人 ID' })
  uid: number;

  @ApiProperty()
  @Column({ length: 64, default: '', comment: '操作人账号' })
  username: string;

  @ApiProperty()
  @Column({ length: 64, comment: '模块' })
  module: string;

  @ApiProperty()
  @Column({ length: 255, comment: '操作摘要' })
  action: string;

  @ApiProperty()
  @Column({ length: 255, nullable: true, comment: '请求地址' })
  url?: string;

  @ApiProperty()
  @Column({ length: 16, nullable: true, comment: 'HTTP 方法' })
  method?: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true, comment: '请求参数' })
  params?: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true, comment: '响应结果' })
  result?: string;

  @ApiProperty()
  @Column({ type: 'int', default: 0, comment: '耗时 ms' })
  cost: number;

  @ApiProperty()
  @Column({ type: 'tinyint', default: 1, comment: '状态 1=成功 0=失败' })
  status: number;

  @ApiProperty()
  @Column({ length: 255, nullable: true, comment: 'IP' })
  ip?: string;
}
