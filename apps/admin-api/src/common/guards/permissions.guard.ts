import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.admin || request.user;

    if (!admin) {
      throw new ForbiddenException('User context is not authenticated');
    }

    // Super Admin has all permissions
    if (admin.role === 'SUPER_ADMIN') {
      return true;
    }

    const adminPermissions: string[] = admin.permissions || [];
    const hasAll = requiredPermissions.every((perm) =>
      adminPermissions.includes(perm),
    );

    if (!hasAll) {
      const missing = requiredPermissions.filter(
        (perm) => !adminPermissions.includes(perm),
      );
      throw new ForbiddenException(
        `Insufficient permissions. Missing: ${missing.join(', ')}`,
      );
    }

    return true;
  }
}
