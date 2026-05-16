import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateDictTypeDto {
  @ApiProperty({ example: 'User Status' }) @IsString() name: string;
  @ApiProperty({ example: 'user_status' }) @IsString() code: string;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsString() remark?: string;
}

export class UpdateDictTypeDto {
  @ApiProperty() @IsInt() id: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsString() remark?: string;
}

export class QueryDictTypeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsInt() status?: number;
}

export class CreateDictDataDto {
  @ApiProperty() @IsInt() dictTypeId: number;
  @ApiProperty({ example: 'Enabled' }) @IsString() label: string;
  @ApiProperty({ example: '1' }) @IsString() value: string;
  @IsOptional() @IsInt() sort?: number;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsString() remark?: string;
}

export class UpdateDictDataDto {
  @ApiProperty() @IsInt() id: number;
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsString() value?: string;
  @IsOptional() @IsInt() sort?: number;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsString() remark?: string;
}