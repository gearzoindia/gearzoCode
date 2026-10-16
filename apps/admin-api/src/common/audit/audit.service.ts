import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActorType } from '@gearzo/db';

export interface CreateAuditLogInput {
  actorId?: string;
  actorType?: ActorType;
  action: string;
  entity: string;
  entityId?: string;
  before?: any;
  after?: any;
  reason?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: CreateAuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorType: entry.actorType ?? ActorType.ADMIN_ACTOR,
          actorId: entry.actorId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          before: entry.before ? (entry.before as any) : undefined,
          after: entry.after ? (entry.after as any) : undefined,
          reason: entry.reason,
          ip: entry.ip,
          userAgent: entry.userAgent,
        },
      });
    } catch (err: any) {
      // Audit log failures must be reported but should not throw unhandled exception to client
      this.logger.error(`Failed to write audit log: ${err.message}`, err.stack);
    }
  }
}
