import { prisma, PrismaClient } from '@gearzo/db';

export interface AdminScopeInput {
  jurisdictionId?: string;
  role: string;
}

/**
 * Returns all descendant area/jurisdiction IDs for a given root jurisdiction.
 */
export async function getJurisdictionSubtree(
  jurisdictionId: string,
  client: PrismaClient = prisma,
): Promise<string[]> {
  const result: string[] = [jurisdictionId];
  const jurisdictionDelegate = (client as any).jurisdiction;

  if (!jurisdictionDelegate?.findMany) {
    return result;
  }

  const queue: string[] = [jurisdictionId];

  while (queue.length > 0) {
    const parentId = queue.shift()!;
    const children = await jurisdictionDelegate.findMany({
      where: { parentId },
      select: { id: true },
    });

    for (const child of children) {
      result.push(child.id);
      queue.push(child.id);
    }
  }

  return result;
}

/**
 * Builds a Prisma WHERE clause for restricting queries by area based on admin scope.
 */
export async function scopeWhere(
  admin: AdminScopeInput,
  areaField: string = 'areaId',
  client: PrismaClient = prisma,
): Promise<Record<string, any>> {
  // Super Admin can access everything
  if (admin.role === 'SUPER_ADMIN') {
    return {};
  }

  if (!admin.jurisdictionId) {
    // If not super admin and no jurisdiction is assigned, cannot access any jurisdiction records
    return { [areaField]: { in: [] } };
  }

  const subtreeIds = await getJurisdictionSubtree(admin.jurisdictionId, client);
  return {
    [areaField]: { in: subtreeIds },
  };
}

/**
 * Checks if target area is in the admin's permitted jurisdiction scope.
 */
export async function isInScope(
  admin: AdminScopeInput,
  targetAreaId: string,
  client: PrismaClient = prisma,
): Promise<boolean> {
  if (admin.role === 'SUPER_ADMIN') {
    return true;
  }

  if (!admin.jurisdictionId) {
    return false;
  }

  if (admin.jurisdictionId === targetAreaId) {
    return true;
  }

  const subtreeIds = await getJurisdictionSubtree(admin.jurisdictionId, client);
  return subtreeIds.includes(targetAreaId);
}
