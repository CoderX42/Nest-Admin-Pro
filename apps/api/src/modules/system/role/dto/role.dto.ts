import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

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
  @IsOptional() @IsInt() status?: number;
}

export class QueryRoleDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsInt() page?: number;
  @IsOptional() @IsInt() limit?: number;
}

export class AssignPermDto {
  @ApiProperty({ type: [String] })
  menuIds: string[];
  @IsOptional() deptIds?: string[];
}