import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNoticeDto {
  @ApiProperty({ example: 'System Update Notice' }) @IsString() title: string;
  @ApiProperty({ example: 'System will be updated at 2:00 AM...' }) @IsString() content: string;
  @IsOptional() @IsInt() type?: number;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsDateString() publishTime?: string;
}

export class UpdateNoticeDto {
  @ApiProperty() @IsInt() id: number;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsInt() type?: number;
  @IsOptional() @IsInt() status?: number;
  @IsOptional() @IsDateString() publishTime?: string;
}

export class QueryNoticeDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsInt() type?: number;
  @IsOptional() @IsInt() status?: number;
  @Type(() => Number) @IsInt() @Min(1) @IsOptional() page?: number;
  @Type(() => Number) @IsInt() @Min(1) @IsOptional() limit?: number;
}