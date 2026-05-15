import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({ example: 'Frontend Engineer' }) @IsString() name: string;
  @ApiProperty({ example: 'frontend_dev' }) @IsString() code: string;
  @IsOptional() @IsInt() sort?: number;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsString() remark?: string;
}

export class UpdatePostDto {
  @ApiProperty() @IsInt() id: number;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() sort?: number;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsString() remark?: string;
}

export class QueryPostDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsInt() status?: number;
  @Type(() => Number) @IsInt() @Min(1) @IsOptional() page?: number;
  @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit?: number;
}