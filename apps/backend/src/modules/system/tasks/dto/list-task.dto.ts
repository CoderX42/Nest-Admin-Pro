import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListTaskQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页条数', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '名称模糊搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '类型 cron/interval/mission' })
  @IsOptional()
  @IsIn(['cron', 'interval', 'mission'])
  type?: 'cron' | 'interval' | 'mission';

  @ApiPropertyOptional({ description: '状态 0=停止 1=运行' })
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  status?: 0 | 1;
}
