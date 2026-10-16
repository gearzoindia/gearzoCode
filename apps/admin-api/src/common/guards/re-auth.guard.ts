import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_REAUTH_KEY } from '../decorators/require-reauth.decorator';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

@Injectable()
export class ReAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isReAuthRequired = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_REAUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isReAuthRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.admin || request.user;

    if (!admin) {
      throw new ForbiddenException('User context is not authenticated');
    }

    const now = Date.now();
    const reAuthHeader = request.headers['x-reauth-timestamp'];
    const headerTimestamp = reAuthHeader ? parseInt(reAuthHeader as string, 10) : undefined;
    const reAuthAt = admin.reAuthAt || headerTimestamp;

    if (!reAuthAt || isNaN(reAuthAt)) {
      throw new ForbiddenException(
        'Re-authentication required. Please provide a valid re-auth verification within the last 5 minutes.',
      );
    }

    const elapsed = now - reAuthAt;
    if (elapsed < 0 || elapsed > FIVE_MINUTES_MS) {
      throw new ForbiddenException(
        'Re-authentication has expired (valid for 5 minutes). Please re-authenticate before proceeding.',
      );
    }

    return true;
  }
}
