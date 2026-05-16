import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Administrator', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ example: 'admin@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '13800138000', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  deptId?: number;

  @ApiProperty({ example: [1], required: false })
  @IsOptional()
  postIds?: number[];
}

export class UpdateUserDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'Administrator', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ example: 'admin@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '13800138000', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  deptId?: number;

  @ApiProperty({ example: [1], required: false })
  @IsOptional()
  postIds?: number[];
}

export class QueryUserDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ example: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiProperty({ example: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  deptId?: number;

  @ApiProperty({ example: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
