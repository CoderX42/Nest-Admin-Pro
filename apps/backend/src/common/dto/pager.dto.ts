import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { IntersectionType } from '@nestjs/swagger';

export enum OrderEnum {
  ASC = 'asc',
  DESC = 'desc',
}

export class PagerDto {
  @ApiPropertyOptional({ description: '当前页', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ description: '每页条数', default: 10, maximum: 500 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  @IsOptional()
  pageSize: number = 10;

  @ApiPropertyOptional({ description: '排序字段' })
  @IsString()
  @IsOptional()
  field?: string;

  @ApiPropertyOptional({ description: '排序方向', enum: OrderEnum, default: OrderEnum.DESC })
  @IsEnum(OrderEnum)
  @IsOptional()
  order?: OrderEnum = OrderEnum.DESC;
}

/**
 * 查询 DTO 通用写法：分页 + 业务字段
 */
export function withQuery<T>(Base: new () => T) {
  class QueryDto extends IntersectionType(PagerDto, PartialType(Base as any)) {}
  return QueryDto as new () => PagerDto & Partial<T>;
}

// 兼容导入
import { PartialType } from '@nestjs/swagger';
