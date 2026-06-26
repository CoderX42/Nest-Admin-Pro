import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class KickBatchDto {
  @ApiProperty({ description: '用户 ID 列表', example: [2, 3] })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  uids: number[];
}
