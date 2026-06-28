import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListTaskLogQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '按任务名精确过滤' })
  @IsOptional()
  @IsString()
  taskName?: string;

  @ApiPropertyOptional({ description: '1=成功 0=失败' })
  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  status?: 0 | 1;
}
