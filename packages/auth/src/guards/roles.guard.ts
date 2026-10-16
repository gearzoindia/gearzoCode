import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators';
import { ROLE_PERMISSIONS } from '../permissions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User context is not authenticated');
    }

    const userRole = user.role;

    // Check roles if specified
    if (requiredRoles && requiredRoles.length > 0) {
      if (!userRole || !requiredRoles.includes(userRole)) {
        throw new ForbiddenException(
          `Insufficient role permissions. Required one of: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // Check permissions if specified
    if (requiredPermissions && requiredPermissions.length > 0) {
      const allowedPerms = ROLE_PERMISSIONS[userRole] || [];
      const hasAllPerms = requiredPermissions.every((perm) => allowedPerms.includes(perm));

      if (!hasAllPerms) {
        throw new ForbiddenException('Insufficient permissions to perform this action');
      }
    }

    return true;
  }
}
