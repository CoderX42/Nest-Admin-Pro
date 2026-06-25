import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export const DICT_COLORS = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
] as const;

// ===== DictType =====

export class CreateDictTypeDto {
  @ApiProperty({ description: '字典类型编码（唯一）', example: 'user_status' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  code: string;

  @ApiProperty({ description: '字典名称', example: '用户状态' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  name: string;

  @ApiPropertyOptional({ description: '状态 0/1', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string;
}

export class UpdateDictTypeDto {
  @ApiPropertyOptional({ description: '字典名称' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @ApiPropertyOptional({ description: '状态 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string;
}

export class ListDictTypeQueryDto {
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

  @ApiPropertyOptional({ description: '关键字（名称/编码）' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

// ===== DictItem =====

export class CreateDictItemDto {
  @ApiProperty({ description: '所属字典类型编码', example: 'user_status' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  typeCode: string;

  @ApiProperty({ description: '字典项标签', example: '启用' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  label: string;

  @ApiProperty({ description: '字典项值', example: '1' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  value: string;

  @ApiPropertyOptional({
    description: '展示样式',
    example: 'primary',
  })
  @IsOptional()
  @IsString()
  @IsIn(DICT_COLORS as unknown as string[])
  color?: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '状态 0/1', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string;
}

export class UpdateDictItemDto {
  @ApiPropertyOptional({ description: '字典项标签' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  label?: string;

  @ApiPropertyOptional({ description: '字典项值' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  value?: string;

  @ApiPropertyOptional({ description: '展示样式' })
  @IsOptional()
  @IsString()
  @IsIn(DICT_COLORS as unknown as string[])
  color?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '状态 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string;
}

export class ListDictItemQueryDto {
  @ApiProperty({ description: '所属字典类型编码', example: 'user_status' })
  @IsString()
  @IsNotEmpty()
  typeCode: string;

  @ApiPropertyOptional({ description: '关键字（标签/值）' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}
