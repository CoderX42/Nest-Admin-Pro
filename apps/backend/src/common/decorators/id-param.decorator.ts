import { Param, ParseIntPipe } from '@nestjs/common';

export const ID_PARAM = 'id';

/**
 * 路径参数装饰器：自动 ParseInt + 校验 >=1
 */
export const IdParam = () => Param(ID_PARAM, ParseIntPipe);
