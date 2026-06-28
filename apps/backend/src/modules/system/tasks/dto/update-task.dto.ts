import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: '任务描述' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @ApiPropertyOptional({ description: '类型 cron/interval/mission' })
  @IsOptional()
  @IsIn(['cron', 'interval', 'mission'])
  type?: 'cron' | 'interval' | 'mission';

  @ApiPropertyOptional({ description: 'cron 表达式' })
  @IsOptional()
  @IsString()
  @Length(0, 64)
  cron?: string;

  @ApiPropertyOptional({ description: '间隔 ms' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  interval?: number;

  @ApiPropertyOptional({ description: 'mission 名（service 字段）' })
  @IsOptional()
  @IsString()
  @Length(2, 128)
  service?: string;

  @ApiPropertyOptional({ description: '调用参数（JSON 字符串）' })
  @IsOptional()
  @IsString()
  @Length(0, 4000)
  args?: string;
}
