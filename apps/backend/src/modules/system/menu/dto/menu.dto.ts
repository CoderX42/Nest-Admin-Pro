import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuDto {
  @ApiProperty({ example: 'User Management' }) @IsString() name: string;
  @IsOptional() @IsInt() type?: number;
  @IsOptional() @IsInt() parentId?: number;
  @IsOptional() @IsString() path?: string;
  @IsOptional() @IsString() component?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsInt() sort?: number;
  @IsOptional() @IsString() perms?: string;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsInt() external?: number;
  @IsOptional() @IsInt() keepAlive?: number;
  @IsOptional() @IsInt() show?: number;
}

export class UpdateMenuDto {
  @ApiProperty() @IsInt() id: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() type?: number;
  @IsOptional() @IsInt() parentId?: number;
  @IsOptional() @IsString() path?: string;
  @IsOptional() @IsString() component?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsInt() sort?: number;
  @IsOptional() @IsString() perms?: string;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsInt() external?: number;
  @IsOptional() @IsInt() keepAlive?: number;
  @IsOptional() @IsInt() show?: number;
}

export class QueryMenuDto {
  @IsOptional() @IsString() name?: string;
  @Type(() => Number) @IsOptional() @IsInt() type?: number;
  @Type(() => Number) @IsOptional() @IsInt() status?: number;
}
