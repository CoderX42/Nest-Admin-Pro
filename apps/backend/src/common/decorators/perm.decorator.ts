import { SetMetadata } from '@nestjs/common';

export const PERM_KEY = 'nest-admin:perm';

/**
 * 权限校验装饰器
 * 用法：@Perm('system:user:list') 或 @Perm(['system:user:list', 'system:user:create'])
 */
export const Perm = (...perms: string[]) => SetMetadata(PERM_KEY, perms.flat());
