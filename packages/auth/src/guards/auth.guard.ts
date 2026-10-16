import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';
import { JwtService } from '../jwt/jwt.service';
import { prisma, PrismaClient } from '@gearzo/db';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Optional()
    private readonly dbClient?: PrismaClient,
  ) {}

  private get client(): PrismaClient {
    return this.dbClient ?? prisma;
  }

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
      throw new UnauthorizedException('Bearer token missing');
    }

    const appAudience = process.env.APP_AUDIENCE;
    // Decode or verify token
    const payload = await this.jwtService.verifyAccessToken(
      token,
      appAudience ?? request.headers['x-app-audience'] ?? payloadAudience(token),
    );

    // Verify tokenVersion against database if user table is available
    if (payload.sub && payload.aud) {
      const audienceKey = payload.aud.toLowerCase();
      const userDelegate = (this.client as any)[audienceKey] || (this.client as any).user;
      if (userDelegate?.findUnique) {
        try {
          const user = await userDelegate.findUnique({
            where: { id: payload.sub },
            select: { tokenVersion: true, status: true, isBlocked: true },
          });

          if (user) {
            if (user.isBlocked || user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
              throw new UnauthorizedException('Account is blocked or suspended');
            }
            if (user.tokenVersion !== undefined && user.tokenVersion !== payload.tokenVersion) {
              throw new UnauthorizedException('Session invalidated. Please log in again.');
            }
          }
        } catch (err: any) {
          if (err instanceof UnauthorizedException) throw err;
          // Non-blocking if table query fails
        }
      }
    }

    request.user = payload;
    return true;
  }
}

function payloadAudience(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return decoded.aud || '';
    }
  } catch {
    // Return empty string
  }
  return '';
}
