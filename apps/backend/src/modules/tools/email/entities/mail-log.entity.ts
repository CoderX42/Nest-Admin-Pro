import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CompleteEntity } from '@/common/entity/complete.entity';

/** 邮件发送记录 */
@Entity('tool_mail_log')
export class MailLogEntity extends CompleteEntity {
  @ApiProperty({ description: '发件人', example: 'noreply@example.com' })
  @Column({ length: 128, comment: '发件人' })
  from: string;

  @ApiProperty({ description: '收件人（JSON 数组字符串）' })
  @Column({ type: 'text', comment: '收件人' })
  to: string;

  @ApiProperty({ description: '抄送（JSON 数组字符串）', required: false })
  @Column({ type: 'text', nullable: true, comment: '抄送' })
  cc?: string;

  @ApiProperty({ description: '密送（JSON 数组字符串）', required: false })
  @Column({ type: 'text', nullable: true, comment: '密送' })
  bcc?: string;

  @ApiProperty({ description: '主题' })
  @Column({ length: 255, comment: '主题' })
  subject: string;

  @ApiProperty({ description: '内容（text 或 html）' })
  @Column({ type: 'mediumtext', comment: '邮件正文' })
  content: string;

  @ApiProperty({ description: '是否 HTML', example: false })
  @Column({ type: 'tinyint', default: 0, comment: '是否 HTML 0=否 1=是' })
  isHtml: number;

  @ApiProperty({ description: '状态 0=待发送 1=成功 2=失败' })
  @Index()
  @Column({ type: 'tinyint', default: 0, comment: '状态 0=待发送 1=成功 2=失败' })
  status: number;

  @ApiProperty({ description: '错误信息', required: false })
  @Column({ length: 512, nullable: true, comment: '错误信息' })
  errorMessage?: string;

  @ApiProperty({ description: '发送耗时 ms' })
  @Column({ type: 'int', default: 0, comment: '发送耗时 ms' })
  cost: number;

  @ApiProperty({ description: '发送人 ID' })
  @Index()
  @Column({ type: 'bigint', comment: '发送人 ID' })
  uid: number;

  @ApiProperty({ description: '发送人账号' })
  @Column({ length: 64, default: '', comment: '发送人账号' })
  username: string;
}
