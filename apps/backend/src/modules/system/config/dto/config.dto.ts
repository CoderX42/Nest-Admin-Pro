import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateConfigDto {
  @ApiProperty({ example: 'System Name' }) @IsString() name: string;
  @ApiProperty({ example: 'sys_name' }) @IsString() key: string;
  @ApiProperty({ example: 'Nest-Admin-Pro' }) @IsString() value: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() remark?: string;
  @IsOptional() @IsInt() status?: number;
}

export class UpdateConfigDto {
  @ApiProperty() @IsInt() id: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() value?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsString() remark?: string;
}

export class QueryConfigDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() key?: string;
  @IsOptional() @IsInt() status?: number;
}