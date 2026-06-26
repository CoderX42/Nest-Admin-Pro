import { Param, ParseIntPipe } from '@nestjs/common';

export const ID_PARAM = 'id';

/**
 * 路径参数装饰器：自动 ParseInt + 校验 >=1。
 * 默认读取 :id，传入 name 可读取其他路径参数（如 :uid）。
 */
export const IdParam = (name: string = ID_PARAM) => Param(name, ParseIntPipe);
