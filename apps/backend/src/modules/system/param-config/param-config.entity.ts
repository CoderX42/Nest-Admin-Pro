import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompleteEntity } from '@/common/entity/complete.entity';

/** 系统参数配置（如 SYS_USER_INITPASSWORD） */
@Entity('sys_param_config')
export class ParamConfigEntity extends CompleteEntity {
  @ApiProperty()
  @Index({ unique: true })
  @Column({ length: 64, comment: '参数键名' })
  key: string;

  @ApiProperty()
  @Column({ length: 64, comment: '参数名称' })
  name: string;

  @ApiPropertyOptional()
  @Column({ length: 255, comment: '参数值' })
  value: string;

  @ApiPropertyOptional()
  @Column({ length: 32, default: 'string', comment: '值类型 string/number/boolean/json' })
  valueType: string;

  @ApiPropertyOptional()
  @Column({ type: 'tinyint', default: 1, comment: '是否内置 1=是 0=否' })
  builtin: number;

  @ApiPropertyOptional()
  @Column({ length: 255, nullable: true, comment: '备注' })
  remark?: string;
}
