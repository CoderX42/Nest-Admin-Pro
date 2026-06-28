import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/** 创建用户 */
export class CreateUserDto {
  @ApiProperty({ description: '账号', example: 'newuser' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  username: string;

  @ApiProperty({ description: '密码', example: 'abc12345' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  password: string;

  @ApiProperty({ description: '昵称', example: '小张' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  nickname: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '所属部门 ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  deptId?: number;

  @ApiPropertyOptional({ description: '角色 ID 列表', example: [2] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds?: number[];

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

/** 更新用户 */
export class UpdateUserDto {
  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  nickname?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '头像' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  avatar?: string;

  @ApiPropertyOptional({ description: '所属部门 ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  deptId?: number;

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

/** 用户列表查询 */
export class ListUserQueryDto {
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

  @ApiPropertyOptional({ description: '关键字（账号/昵称/手机/邮箱）' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '部门 ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  deptId?: number;

  @ApiPropertyOptional({ description: '状态 0/1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;
}

/** 分配角色 */
export class AssignRolesDto {
  @ApiProperty({ description: '角色 ID 列表', example: [2] })
  @IsArray()
  @IsNumber({}, { each: true })
  roleIds: number[];
}

/** 重置密码 */
export class ResetPasswordDto {
  @ApiProperty({ description: '新密码（明文）', example: 'newpass123' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  password: string;
}
