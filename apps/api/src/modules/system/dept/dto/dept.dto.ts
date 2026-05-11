import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateDeptDto {
  @ApiProperty({ example: 'Technology Department' })
  @IsString() name: string;
  @IsOptional() @IsInt() parentId?: number;
  @IsOptional() @IsInt() sort?: number;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsInt() leaderId?: number;
}

export class UpdateDeptDto {
  @ApiProperty() @IsInt() id: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() parentId?: number;
  @IsOptional() @IsInt() sort?: number;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsInt() leaderId?: number;
}

export class QueryDeptDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() status?: number;
}