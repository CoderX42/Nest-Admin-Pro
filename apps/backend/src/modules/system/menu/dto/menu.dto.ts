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

export const MENU_TYPES = [1, 2, 3] as const;
export type MenuType = (typeof MENU_TYPES)[number];

/** 创建菜单 */
export class CreateMenuDto {
  @ApiProperty({ description: '父菜单 ID，0=根', example: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  parentId: number;

  @ApiProperty({ description: '菜单名称', example: '用户管理' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  name: string;

  @ApiProperty({ description: '类型 1=目录 2=菜单 3=按钮', example: 2 })
  @Type(() => Number)
  @IsInt()
  @IsIn(MENU_TYPES as unknown as number[], { message: 'type 必须是 1/2/3' })
  type: MenuType;

  @ApiPropertyOptional({ description: '路由路径' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  path?: string;

  @ApiPropertyOptional({ description: '前端组件' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  component?: string;

  @ApiPropertyOptional({ description: '重定向' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  redirect?: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsOptional()
  @IsString()
  @Length(0, 64)
  icon?: string;

  @ApiPropertyOptional({ description: '排序', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '权限字符串（多个用逗号分隔）' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  perms?: string;

  @ApiPropertyOptional({ description: '是否隐藏 0/1', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hide?: number;

  @ApiPropertyOptional({ description: '是否缓存 0/1', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  keepAlive?: number;

  @ApiPropertyOptional({ description: '是否外链 0/1', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  external?: number;

  @ApiPropertyOptional({ description: '状态 0=禁用 1=启用', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

/** 更新菜单 */
export class UpdateMenuDto {
  @ApiPropertyOptional({ description: '父菜单 ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  parentId?: number;

  @ApiPropertyOptional({ description: '菜单名称' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @ApiPropertyOptional({ description: '类型 1/2/3' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn(MENU_TYPES as unknown as number[])
  type?: MenuType;

  @ApiPropertyOptional({ description: '路由路径' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  path?: string;

  @ApiPropertyOptional({ description: '前端组件' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  component?: string;

  @ApiPropertyOptional({ description: '重定向' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  redirect?: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsOptional()
  @IsString()
  @Length(0, 64)
  icon?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: '权限字符串' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  perms?: string;

  @ApiPropertyOptional({ description: '是否隐藏 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hide?: number;

  @ApiPropertyOptional({ description: '是否缓存 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  keepAlive?: number;

  @ApiPropertyOptional({ description: '是否外链 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  external?: number;

  @ApiPropertyOptional({ description: '状态 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

/** 菜单列表查询 */
export class ListMenuQueryDto {
  @ApiPropertyOptional({ description: '关键字（名称/路径/perms）' })
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
