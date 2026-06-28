import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IdDto {
  @ApiProperty({ description: '资源 ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

export class IdsDto {
  @ApiProperty({ description: '资源 ID 列表', type: [Number] })
  @Type(() => Number)
  @IsInt({ each: true })
  ids: number[];
}

export class IdParamDto {
  @ApiProperty({ description: '路径参数 ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
