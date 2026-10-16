import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { JurisdictionScopeContext } from '../../common/guards';
import { Prisma } from '@gearzo/db';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(dto: QueryAuditLogsDto, scope: JurisdictionScopeContext) {
    const page = dto.page || 1;
    const limit = dto.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (dto.actorId) {
      where.actorId = dto.actorId;
    } else if (!scope.isSuperAdmin) {
      // Find all admins in subtree to restrict audit visibility to subtree actors
      const subtreeAdmins = await this.prisma.admin.findMany({
        where: { jurisdictionId: { in: scope.subtreeIds } },
        select: { id: true },
      });
      const adminIds = subtreeAdmins.map((a) => a.id);
      where.actorId = { in: adminIds };
    }

    if (dto.entity) {
      where.entity = dto.entity;
    }

    if (dto.action) {
      where.action = { contains: dto.action, mode: 'insensitive' };
    }

    if (dto.from || dto.to) {
      where.createdAt = {};
      if (dto.from) where.createdAt.gte = new Date(dto.from);
      if (dto.to) where.createdAt.lte = new Date(dto.to);
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
