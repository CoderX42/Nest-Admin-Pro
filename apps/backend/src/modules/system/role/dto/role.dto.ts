import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/** 创建角色 */
export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '运营' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  name: string;

  @ApiProperty({ description: '角色编码（唯一）', example: 'operator' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  code: string;

  @ApiPropertyOptional({ description: '排序', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({
    description: '数据权限范围 1=全部 2=本部门 3=本部门及下级 4=本人 5=自定义',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dataScope?: number;

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

  @ApiPropertyOptional({ description: '菜单 ID 列表' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  menuIds?: number[];
}

/** 更新角色 */
export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '数据权限范围 1-5' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dataScope?: number;

  @ApiPropertyOptional({ description: '状态 0=禁用 1=启用' })
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

/** 角色列表查询 */
export class ListRoleQueryDto {
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

/** 分配菜单 */
export class AssignMenusDto {
  @ApiProperty({ description: '菜单 ID 列表', example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  menuIds: number[];
}
