import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/** 创建部门 */
export class CreateDeptDto {
  @ApiProperty({ description: '部门名称', example: '研发中心' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  name: string;

  @ApiProperty({ description: '父部门 ID，0=根', example: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  parentId: number;

  @ApiPropertyOptional({ description: '部门编码' })
  @IsOptional()
  @IsString()
  @Length(0, 64)
  code?: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '负责人' })
  @IsOptional()
  @IsString()
  @Length(0, 64)
  leader?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  @Length(0, 32)
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  @Length(0, 128)
  email?: string;

  @ApiPropertyOptional({ description: '状态 0=禁用 1=启用', example: 1 })
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

/** 更新部门 */
export class UpdateDeptDto {
  @ApiPropertyOptional({ description: '部门名称' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @ApiPropertyOptional({ description: '父部门 ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  parentId?: number;

  @ApiPropertyOptional({ description: '部门编码' })
  @IsOptional()
  @IsString()
  @Length(0, 64)
  code?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '负责人' })
  @IsOptional()
  @IsString()
  @Length(0, 64)
  leader?: string;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  @Length(0, 32)
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsString()
  @Length(0, 128)
  email?: string;

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

/** 部门列表查询 */
export class ListDeptQueryDto {
  @ApiPropertyOptional({ description: '关键字（名称/编码/负责人）' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({
    description: '返回格式：tree=树形 list=扁平',
    example: 'tree',
  })
  @IsOptional()
  @IsString()
  format?: 'tree' | 'list';
}
