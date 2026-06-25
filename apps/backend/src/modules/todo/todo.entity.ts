import { Column, Entity } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompleteEntity } from '@/common/entity/complete.entity';

/** 示例 TODO（用于演示基础 CRUD + 多租户扩展） */
@Entity('todo')
export class TodoEntity extends CompleteEntity {
  @ApiProperty()
  @Column({ length: 255, comment: '标题' })
  title: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true, comment: '详情' })
  content?: string;

  @ApiProperty()
  @Column({ type: 'tinyint', default: 0, comment: '0=未完成 1=已完成' })
  done: number;
}
