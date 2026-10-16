import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getJurisdictionSubtree, isInScope } from '@gearzo/domain';

export interface JurisdictionScopeContext {
  rootId: string;
  isSuperAdmin: boolean;
  subtreeIds: string[];
}

@Injectable()
export class JurisdictionScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const admin = request.admin || request.user;

    if (!admin) {
      throw new ForbiddenException('User context is not authenticated');
    }

    // Super Admin has global scope
    if (admin.role === 'SUPER_ADMIN') {
      request.jurisdictionScope = {
        rootId: admin.jurisdictionId || '',
        isSuperAdmin: true,
        subtreeIds: [],
      };
      return true;
    }

    const adminJurisdictionId = admin.jurisdictionId;
    if (!adminJurisdictionId) {
      throw new ForbiddenException('Admin user is missing an assigned jurisdiction');
    }

    // Fetch subtree for current admin's jurisdiction
    const subtreeIds = await getJurisdictionSubtree(adminJurisdictionId, this.prisma);

    request.jurisdictionScope = {
      rootId: adminJurisdictionId,
      isSuperAdmin: false,
      subtreeIds,
    };

    // Check if a specific target jurisdiction or area is requested in params, query, or body
    const targetAreaId =
      request.params?.areaId ||
      request.params?.jurisdictionId ||
      request.query?.areaId ||
      request.query?.jurisdictionId ||
      request.body?.areaId ||
      request.body?.jurisdictionId;

    if (targetAreaId) {
      const allowed = await isInScope(
        { jurisdictionId: adminJurisdictionId, role: admin.role },
        targetAreaId,
        this.prisma,
      );

      if (!allowed) {
        throw new ForbiddenException(
          'Target resource is outside your authorized jurisdiction subtree',
        );
      }
    }

    return true;
  }
}
