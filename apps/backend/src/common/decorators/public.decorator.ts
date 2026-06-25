import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'nest-admin:public';

/** 完全公开，绕过 JWT + RBAC + Throttler */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
