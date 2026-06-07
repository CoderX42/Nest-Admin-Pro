import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: '演示租户' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'demo' })
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  contactUser?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsDateString()
  expireAt?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @IsOptional()
  @IsString()
  packageCode?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateTenantDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contactUser?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  status?: number;

  @IsOptional()
  @IsDateString()
  expireAt?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @IsOptional()
  @IsString()
  packageCode?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class QueryTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  status?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
