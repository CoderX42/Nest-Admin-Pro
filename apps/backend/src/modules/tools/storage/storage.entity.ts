import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CompleteEntity } from '@/common/entity/complete.entity';

/** 文件存储记录（本地磁盘 + OSS 共用） */
@Entity('tool_storage')
export class StorageEntity extends CompleteEntity {
  @ApiProperty()
  @Column({ type: 'bigint', comment: '上传人 ID' })
  uid: number;

  @ApiProperty()
  @Column({ length: 64, comment: '原始文件名' })
  originalName: string;

  @ApiProperty()
  @Column({ length: 128, comment: '存储文件名（含扩展名）' })
  filename: string;

  @ApiProperty()
  @Column({ length: 32, comment: '扩展名' })
  ext: string;

  @ApiProperty()
  @Column({ length: 64, comment: 'MIME' })
  mime: string;

  @ApiProperty()
  @Index()
  @Column({ length: 32, default: 'local', comment: '存储类型 local/qiniu/...' })
  driver: string;

  @ApiProperty()
  @Column({ length: 255, comment: '访问 URL / OSS Key' })
  url: string;

  @ApiProperty()
  @Column({ length: 255, nullable: true, comment: '存储路径' })
  path?: string;

  @ApiProperty()
  @Column({ type: 'bigint', comment: '文件大小 字节' })
  size: number;
}
