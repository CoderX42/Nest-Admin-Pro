import { SetMetadata } from '@nestjs/common';

export const BYPASS_KEY = 'nest-admin:bypass';

/** 不走 TransformInterceptor 包装（按原样返回） */
export const Bypass = () => SetMetadata(BYPASS_KEY, true);
