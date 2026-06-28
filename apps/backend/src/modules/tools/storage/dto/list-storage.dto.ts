import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export const STORAGE_DRIVERS = ['local', 'qiniu'] as const;

export class ListStorageQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '关键字（原始文件名 / 存储文件名）' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '驱动类型过滤', enum: STORAGE_DRIVERS })
  @IsOptional()
  @IsString()
  @IsIn(STORAGE_DRIVERS as unknown as string[])
  driver?: string;
}
