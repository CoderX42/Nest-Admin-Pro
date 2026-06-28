import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export const PARAM_VALUE_TYPES = ['string', 'number', 'boolean', 'json'] as const;

export class CreateParamConfigDto {
  @ApiProperty({ description: '参数键名（唯一）', example: 'sys.user.initPassword' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  key: string;

  @ApiProperty({ description: '参数名称', example: '用户初始密码' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 64)
  name: string;

  @ApiProperty({ description: '参数值', example: 'abc12345' })
  @IsString()
  @IsNotEmpty()
  @Length(0, 255)
  value: string;

  @ApiPropertyOptional({
    description: '值类型',
    example: 'string',
  })
  @IsOptional()
  @IsString()
  @IsIn(PARAM_VALUE_TYPES as unknown as string[])
  valueType?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string;
}

export class UpdateParamConfigDto {
  @ApiPropertyOptional({ description: '参数名称' })
  @IsOptional()
  @IsString()
  @Length(1, 64)
  name?: string;

  @ApiPropertyOptional({ description: '参数值' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  value?: string;

  @ApiPropertyOptional({ description: '值类型' })
  @IsOptional()
  @IsString()
  @IsIn(PARAM_VALUE_TYPES as unknown as string[])
  valueType?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  remark?: string;
}

export class ListParamConfigQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '关键字（key/name）' })
  @IsOptional()
  @IsString()
  keyword?: string;
}
