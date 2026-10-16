import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { prisma, PrismaClient } from '@gearzo/db';

@Injectable()
export class JurisdictionScopeGuard implements CanActivate {
  constructor(
    @Optional()
    private readonly dbClient?: PrismaClient,
  ) {}

  private get client(): PrismaClient {
    return this.dbClient ?? prisma;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context is not authenticated');
    }

    // Super Admin has global jurisdiction scope
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const adminJurisdictionId = user.jurisdictionId;
    if (!adminJurisdictionId) {
      throw new ForbiddenException('Admin user is missing an assigned jurisdiction');
    }

    // Target jurisdiction or area requested in params, query, or body
    const targetAreaId =
      request.params?.areaId ||
      request.params?.jurisdictionId ||
      request.query?.areaId ||
      request.query?.jurisdictionId ||
      request.body?.areaId ||
      request.body?.jurisdictionId;

    if (!targetAreaId) {
      // If endpoint is not targeting a specific area, attach subtree to request for query filtering
      return true;
    }

    // Direct match
    if (adminJurisdictionId === targetAreaId) {
      return true;
    }

    // Check if targetAreaId is in admin's subtree
    const inSubtree = await this.isAreaInJurisdictionSubtree(adminJurisdictionId, targetAreaId);
    if (!inSubtree) {
      throw new ForbiddenException('Target resource is outside your authorized jurisdiction');
    }

    return true;
  }

  private async isAreaInJurisdictionSubtree(rootId: string, targetId: string): Promise<boolean> {
    const jurisdictionDelegate = (this.client as any).jurisdiction;
    if (!jurisdictionDelegate?.findUnique) {
      return rootId === targetId;
    }

    // Traverse upwards from targetId to see if rootId is an ancestor
    let currentId: string | null = targetId;
    const visited = new Set<string>();

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      if (currentId === rootId) {
        return true;
      }

      const node: { parentId: string | null } | null = await jurisdictionDelegate.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = node?.parentId ?? null;
    }

    return false;
  }
}
