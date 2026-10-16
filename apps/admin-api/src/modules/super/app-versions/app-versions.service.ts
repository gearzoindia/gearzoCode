import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { CreateAppVersionDto, UpdateAppVersionDto } from './dto';

@Injectable()
export class AppVersionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.appVersion.findMany({
      orderBy: [{ app: 'asc' }, { platform: 'asc' }],
    });
  }

  async findOne(id: string) {
    const version = await this.prisma.appVersion.findUnique({ where: { id } });
    if (!version) throw new NotFoundException('App version record not found');
    return version;
  }

  async create(dto: CreateAppVersionDto, adminId: string) {
    const record = await this.prisma.appVersion.create({
      data: {
        app: dto.app,
        platform: dto.platform,
        minSupportedVersion: dto.minSupportedVersion,
        latestVersion: dto.latestVersion,
        message: dto.message,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'APP_VERSION_CREATE',
      entity: 'AppVersion',
      entityId: record.id,
      after: record,
      reason: 'Published app version constraint',
    });

    return record;
  }

  async update(id: string, dto: UpdateAppVersionDto, adminId: string) {
    const existing = await this.prisma.appVersion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('App version record not found');

    const updated = await this.prisma.appVersion.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      actorId: adminId,
      action: 'APP_VERSION_UPDATE',
      entity: 'AppVersion',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Updated minimum/latest version requirements',
    });

    return updated;
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.appVersion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('App version record not found');

    await this.prisma.appVersion.delete({ where: { id } });

    await this.audit.log({
      actorId: adminId,
      action: 'APP_VERSION_DELETE',
      entity: 'AppVersion',
      entityId: id,
      reason: 'Deleted app version record',
    });

    return { message: 'App version record deleted', id };
  }
}
