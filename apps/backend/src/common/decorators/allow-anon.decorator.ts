import { SetMetadata } from '@nestjs/common';

export const ALLOW_ANON_KEY = 'nest-admin:allow-anon';

/** 仅需登录，不校验具体权限 */
export const AllowAnon = () => SetMetadata(ALLOW_ANON_KEY, true);
