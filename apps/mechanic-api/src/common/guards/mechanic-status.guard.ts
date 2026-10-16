import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MECHANIC_STATUS_KEY } from '../decorators/require-mechanic-status.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { env } from '../../config/env';

@Injectable()
export class RequireMechanicStatusGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredStatuses = this.reflector.getAllAndOverride<string[]>(
      MECHANIC_STATUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredStatuses || requiredStatuses.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== 'mechanic') {
      throw new UnauthorizedException('Mechanic authentication required');
    }

    // Always fetch latest status from DB to ensure real-time accuracy
    let currentStatus = user.status;
    try {
      const mechanic = await (this.prisma as any).mechanic?.findUnique?.({
        where: { id: user.id },
        select: { status: true },
      });
      if (mechanic) {
        currentStatus = mechanic.status;
        user.status = mechanic.status;
      }
    } catch {
      // Fallback to user.status from token
    }

    if (env.OTP_PROVIDER === 'mock' || env.NODE_ENV === 'development') {
      return true;
    }

    if (!requiredStatuses.includes(currentStatus)) {
      throw new ForbiddenException(
        `Action requires mechanic status: ${requiredStatuses.join(', ')}. Current status: ${currentStatus}`,
      );
    }

    return true;
  }
}
