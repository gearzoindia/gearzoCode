import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateBroadcastDto } from './dto';
import { JurisdictionScopeContext, AuthenticatedAdmin } from '../../common/guards';
import { BroadcastStatus } from '@gearzo/db';

@Injectable()
export class BroadcastsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(scope: JurisdictionScopeContext) {
    return this.prisma.broadcast.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(dto: CreateBroadcastDto, admin: AuthenticatedAdmin, scope: JurisdictionScopeContext) {
    // Scope Validation:
    // SUB_DIV: own areas, DIV: own division, SUPER: all
    if (!scope.isSuperAdmin && dto.filters?.areaId) {
      if (!scope.subtreeIds.includes(dto.filters.areaId)) {
        throw new ForbiddenException(
          'Target area in broadcast filter is outside your authorized jurisdiction subtree.',
        );
      }
    }

    // Rate Limit: 3/day per audience per area/jurisdiction
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCount = await this.prisma.broadcast.count({
      where: {
        audience: dto.audience,
        createdById: admin.id,
        createdAt: { gte: startOfToday },
      },
    });

    if (todayCount >= 3) {
      throw new BadRequestException(
        'Rate limit exceeded: You have reached the maximum of 3 broadcasts per day for this audience.',
      );
    }

    const scheduledDate = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    const isFuture = scheduledDate && scheduledDate.getTime() > Date.now();

    const broadcast = await this.prisma.broadcast.create({
      data: {
        audience: dto.audience,
        title: dto.title,
        body: dto.body,
        filters: dto.filters || {},
        scheduledAt: scheduledDate,
        status: isFuture ? BroadcastStatus.SCHEDULED : BroadcastStatus.SENT,
        createdById: admin.id,
        sentCount: isFuture ? 0 : 120, // simulated dispatched count
      },
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'BROADCAST_SEND',
      entity: 'Broadcast',
      entityId: broadcast.id,
      after: { audience: dto.audience, title: dto.title, status: broadcast.status },
      reason: 'Administrative broadcast sent/scheduled',
    });

    return broadcast;
  }

  async cancel(id: string, adminId: string) {
    const broadcast = await this.prisma.broadcast.findUnique({ where: { id } });
    if (!broadcast) throw new NotFoundException('Broadcast not found');

    if (broadcast.status !== BroadcastStatus.SCHEDULED) {
      throw new BadRequestException(
        `Cannot cancel broadcast with status '${broadcast.status}'. Only scheduled broadcasts can be cancelled.`,
      );
    }

    const updated = await this.prisma.broadcast.update({
      where: { id },
      data: { status: BroadcastStatus.CANCELLED_BROADCAST },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'BROADCAST_CANCEL',
      entity: 'Broadcast',
      entityId: id,
      reason: 'Cancelled scheduled broadcast',
    });

    return updated;
  }
}
