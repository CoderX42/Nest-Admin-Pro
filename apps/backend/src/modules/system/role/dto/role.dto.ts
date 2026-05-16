import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty({ example: 'Super Admin' })
  @IsString()
  name: string;
  @ApiProperty({ example: 'super_admin' })
  @IsString()
  code: string;
  @IsOptional()
  dataScope?: number;
}

export class UpdateRoleDto {
  @ApiProperty()
  @IsInt()
  id: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() dataScope?: number;
  @Type(() => Number) @IsOptional() @IsInt() status?: number;
}

export class QueryRoleDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() code?: string;
  @Type(() => Number) @IsOptional() @IsInt() status?: number;
  @Type(() => Number) @IsInt() @Min(1) @IsOptional() page?: number;
  @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit?: number;
}

export class AssignPermDto {
  @ApiProperty({ type: [String] })
  menuIds: string[];
  @IsOptional() deptIds?: string[];
}
