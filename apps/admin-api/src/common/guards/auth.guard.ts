import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtService, ROLE_PERMISSIONS, PERMISSIONS } from '@gearzo/auth';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedAdmin } from '../decorators/current-admin.decorator';
export type { AuthenticatedAdmin };

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is missing or malformed');
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token is missing');
    }

    // Verify token with admin audience
    const payload = await this.jwtService.verifyAccessToken(token, 'admin');

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      include: {
        permissionOverrides: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin account not found');
    }

    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Account is ${admin.status.toLowerCase()}`);
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is locked due to multiple failed login attempts');
    }

    if (admin.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Session has been invalidated. Please log in again.');
    }

    // Compute effective permissions
    let permissions: string[] = [];
    if (admin.role === 'SUPER_ADMIN') {
      permissions = Object.keys(PERMISSIONS);
    } else {
      const basePerms = ROLE_PERMISSIONS[admin.role] || [];
      const permSet = new Set<string>(basePerms);

      for (const override of admin.permissionOverrides) {
        if (override.granted) {
          permSet.add(override.permission);
        } else {
          permSet.delete(override.permission);
        }
      }
      permissions = Array.from(permSet);
    }

    // Check optional re-auth header or token claim
    const reAuthHeader = request.headers['x-reauth-timestamp'];
    const reAuthAt = reAuthHeader ? parseInt(reAuthHeader as string, 10) : undefined;

    const authenticatedAdmin = {
      id: admin.id,
      email: admin.email,
      phone: admin.phone,
      name: admin.name,
      role: admin.role,
      jurisdictionId: admin.jurisdictionId,
      tokenVersion: admin.tokenVersion,
      permissions,
      reAuthAt,
    };

    request.user = authenticatedAdmin;
    request.admin = authenticatedAdmin;

    return true;
  }
}
