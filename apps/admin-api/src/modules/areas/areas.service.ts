import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { PauseAreaDto } from './dto/pause-area.dto';
import { JurisdictionScopeContext, AuthenticatedAdmin } from '../../common/guards';

@Injectable()
export class AreasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async pause(id: string, dto: PauseAreaDto, admin: AuthenticatedAdmin, scope: JurisdictionScopeContext) {
    const area = await this.prisma.jurisdiction.findUnique({ where: { id } });
    if (!area) throw new NotFoundException('Jurisdiction area not found');

    if (!scope.isSuperAdmin && !scope.subtreeIds.includes(id)) {
      throw new ForbiddenException('Area is outside your authorized jurisdiction subtree');
    }

    const resumeDate = dto.resumeAt
      ? new Date(dto.resumeAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // default 24h

    const updated = await this.prisma.jurisdiction.update({
      where: { id },
      data: {
        pausedUntil: resumeDate,
        pauseMessage: dto.message,
      },
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'AREA_PAUSE',
      entity: 'Jurisdiction',
      entityId: id,
      before: { pausedUntil: area.pausedUntil, pauseMessage: area.pauseMessage },
      after: { pausedUntil: resumeDate, pauseMessage: dto.message },
      reason: dto.message,
    });

    return {
      id: updated.id,
      name: updated.name,
      isPaused: true,
      pausedUntil: updated.pausedUntil,
      pauseMessage: updated.pauseMessage,
      message: `New bookings in area '${updated.name}' have been paused.`,
    };
  }

  async resume(id: string, admin: AuthenticatedAdmin, scope: JurisdictionScopeContext) {
    const area = await this.prisma.jurisdiction.findUnique({ where: { id } });
    if (!area) throw new NotFoundException('Jurisdiction area not found');

    if (!scope.isSuperAdmin && !scope.subtreeIds.includes(id)) {
      throw new ForbiddenException('Area is outside your authorized jurisdiction subtree');
    }

    const updated = await this.prisma.jurisdiction.update({
      where: { id },
      data: {
        pausedUntil: null,
        pauseMessage: null,
      },
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'AREA_RESUME',
      entity: 'Jurisdiction',
      entityId: id,
      before: { pausedUntil: area.pausedUntil, pauseMessage: area.pauseMessage },
      after: { pausedUntil: null, pauseMessage: null },
      reason: 'Administrative manual resumption of operations',
    });

    return {
      id: updated.id,
      name: updated.name,
      isPaused: false,
      message: `Operations in area '${updated.name}' resumed. Bookings open.`,
    };
  }
}
