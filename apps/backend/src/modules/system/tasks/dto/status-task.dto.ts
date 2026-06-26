import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn } from 'class-validator';

export class TaskStatusDto {
  @ApiProperty({ description: '0=停止 1=运行', enum: [0, 1] })
  @Type(() => Number)
  @IsIn([0, 1])
  status: 0 | 1;
}
