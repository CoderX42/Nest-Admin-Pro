import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteDto {
  @ApiProperty({ description: '要删除的 ID' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

export class BatchDeleteDto {
  @ApiProperty({ description: '要删除的 ID 列表', type: [Number] })
  ids: number[];
}
