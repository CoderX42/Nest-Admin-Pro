import { ApiHideProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

/**
 * 由 CreatorPipe / UpdaterPipe 自动注入
 * Controller DTO 继承此类即可接收当前操作者 ID
 */
export class OperatorDto {
  @ApiHideProperty()
  @IsOptional()
  createBy?: number;

  @ApiHideProperty()
  @IsOptional()
  updateBy?: number;
}
