import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MECHANIC_STATUS_KEY } from '../decorators';
import { prisma, PrismaClient } from '@gearzo/db';

@Injectable()
export class RequireMechanicStatusGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional()
    private readonly dbClient?: PrismaClient,
  ) {}

  private get client(): PrismaClient {
    return this.dbClient ?? prisma;
  }

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

    if (!user || user.aud?.toLowerCase() !== 'mechanic') {
      throw new ForbiddenException('Endpoint requires mechanic authentication');
    }

    const mechanicDelegate = (this.client as any).mechanic;
    if (mechanicDelegate?.findUnique) {
      const mechanic = await mechanicDelegate.findUnique({
        where: { id: user.sub },
        select: { status: true },
      });

      if (!mechanic) {
        throw new ForbiddenException('Mechanic profile not found');
      }

      if (!requiredStatuses.includes(mechanic.status)) {
        throw new ForbiddenException(
          `Action requires mechanic status: ${requiredStatuses.join(', ')}. Current status: ${mechanic.status}`,
        );
      }
    }

    return true;
  }
}
