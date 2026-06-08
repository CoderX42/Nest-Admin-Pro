import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConfigDto {
  @ApiProperty({ example: 'System Name' }) @IsString() configName: string;
  @ApiProperty({ example: 'sys_name' }) @IsString() configKey: string;
  @ApiProperty({ example: 'Nest-Admin-Pro' }) @IsString() configValue: string;
  @IsOptional() @IsString() configType?: string;
  @IsOptional() @IsString() remark?: string;
  @IsOptional() @IsInt() status?: number;
}

export class UpdateConfigDto {
  @ApiProperty() @IsInt() id: number;
  @IsOptional() @IsString() configName?: string;
  @IsOptional() @IsString() configValue?: string;
  @IsOptional() @IsString() configType?: string;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsString() remark?: string;
}

export class QueryConfigDto {
  @IsOptional() @IsString() configName?: string;
  @IsOptional() @IsString() configKey?: string;
  @Type(() => Number) @IsOptional() @IsInt() status?: number;
  @Type(() => Number) @IsOptional() @IsInt() @Min(1) page?: number;
  @Type(() => Number) @IsOptional() @IsInt() @Min(1) limit?: number;
}
