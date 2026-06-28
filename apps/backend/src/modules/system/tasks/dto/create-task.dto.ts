import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Min } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: '任务唯一名（不可重复）', example: 'system.test.echo' })
  @IsString()
  @Length(2, 64)
  @Matches(/^[a-z][a-z0-9_.:-]*$/, { message: 'name 必须以小写字母开头，仅含小写字母/数字/_/./:/-' })
  name: string;

  @ApiPropertyOptional({ description: '任务描述', default: '' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @ApiProperty({ description: '类型 cron/interval/mission', example: 'mission' })
  @IsIn(['cron', 'interval', 'mission'])
  type: 'cron' | 'interval' | 'mission';

  @ApiPropertyOptional({ description: 'cron 表达式（type=cron 时必填）' })
  @IsOptional()
  @IsString()
  @Length(0, 64)
  cron?: string;

  @ApiPropertyOptional({ description: '间隔 ms（type=interval 时必填）' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(100)
  interval?: number;

  @ApiPropertyOptional({ description: 'mission 名（type=mission 时必填）', example: 'system.test.echo' })
  @IsOptional()
  @IsString()
  @Length(2, 128)
  service?: string;

  @ApiPropertyOptional({ description: '调用参数（JSON 字符串）', default: '{}' })
  @IsOptional()
  @IsString()
  @Length(0, 4000)
  args?: string;

  @ApiPropertyOptional({ description: '状态 0=停止 1=运行', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  status?: 0 | 1;
}
