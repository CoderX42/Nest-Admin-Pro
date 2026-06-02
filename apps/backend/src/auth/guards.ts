import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export { IS_PUBLIC_KEY, Public } from '../common/decorators/public.decorator';

export const ROLES_KEY = 'roles';
export const RequireRole = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const PERMS_KEY = 'permissions';
export const RequirePermission = (...perms: string[]) => SetMetadata(PERMS_KEY, perms);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.roles) return false;
    return user.roles.some((role: any) => requiredRoles.includes(role.code));
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPerms = this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPerms) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.permissions) return false;
    return requiredPerms.every((perm) => user.permissions.includes(perm));
  }
}
