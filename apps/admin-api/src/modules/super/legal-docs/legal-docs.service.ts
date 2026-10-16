import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AuditService } from '../../../common/audit/audit.service';
import { CreateLegalDocDto, UpdateLegalDocDto } from './dto';

@Injectable()
export class LegalDocsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    return this.prisma.legalDocument.findMany({
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.legalDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Legal document not found');
    return doc;
  }

  async create(dto: CreateLegalDocDto, adminId: string) {
    const doc = await this.prisma.legalDocument.create({
      data: {
        type: dto.type,
        version: dto.version,
        url: dto.url,
        publishedAt: new Date(dto.publishedAt),
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'LEGAL_DOC_CREATE',
      entity: 'LegalDocument',
      entityId: doc.id,
      after: doc,
      reason: 'Published new legal terms or privacy policy version',
    });

    return doc;
  }

  async update(id: string, dto: UpdateLegalDocDto, adminId: string) {
    const existing = await this.prisma.legalDocument.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Legal document not found');

    const updated = await this.prisma.legalDocument.update({
      where: { id },
      data: {
        url: dto.url,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'LEGAL_DOC_UPDATE',
      entity: 'LegalDocument',
      entityId: id,
      before: existing,
      after: updated,
      reason: 'Updated legal document resource link or published date',
    });

    return updated;
  }

  async remove(id: string, adminId: string) {
    const existing = await this.prisma.legalDocument.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Legal document not found');

    await this.prisma.legalDocument.delete({ where: { id } });

    await this.audit.log({
      actorId: adminId,
      action: 'LEGAL_DOC_DELETE',
      entity: 'LegalDocument',
      entityId: id,
      reason: 'Removed obsolete legal document reference',
    });

    return { message: 'Legal document deleted', id };
  }
}
