import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser() -> IAuthUser
 * @CurrentUser('uid') -> uid 字段
 */
export interface IAuthUser {
  uid: number;
  pv: number;
  username?: string;
  exp?: number;
  iat?: number;
  roles?: string[];
  jti?: string;
}

export const CurrentUser = createParamDecorator(
  (key: keyof IAuthUser | undefined, ctx: ExecutionContext): any => {
    const req = ctx.switchToHttp().getRequest();
    const user: IAuthUser = req.user;
    return key ? user?.[key] : user;
  },
);
