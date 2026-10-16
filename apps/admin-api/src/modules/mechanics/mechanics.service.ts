import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { SessionService } from '@gearzo/auth';
import {
  QueryMechanicsDto,
  ReviewKycDto,
  SuspendMechanicDto,
} from './dto';
import { JurisdictionScopeContext, AuthenticatedAdmin } from '../../common/guards';
import {
  MechanicStatus,
  DocStatus,
  ApprovalRequestType,
  BackgroundReviewStatus,
  Prisma,
} from '@gearzo/db';

@Injectable()
export class MechanicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly sessionService: SessionService,
  ) {}

  async findAll(dto: QueryMechanicsDto, scope: JurisdictionScopeContext) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.MechanicWhereInput = {};

    if (dto.areaId) {
      where.areaId = dto.areaId;
    } else if (!scope.isSuperAdmin) {
      where.areaId = { in: scope.subtreeIds };
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.search) {
      where.OR = [
        { name: { contains: dto.search, mode: 'insensitive' } },
        { phone: { contains: dto.search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.mechanic.findMany({
        where,
        include: {
          area: { select: { id: true, name: true } },
          profile: {
            select: {
              shopName: true,
              ratingAvg: true,
              ratingCount: true,
              serviceModes: true,
            },
          },
          presence: { select: { status: true, lastSeenAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.mechanic.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, scope: JurisdictionScopeContext) {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id },
      include: {
        profile: true,
        area: true,
        vehicleTypes: true,
        services: { include: { service: true } },
        equipment: true,
        documents: {
          select: {
            id: true,
            docType: true,
            status: true,
            numberLast4: true,
            rejectionReason: true,
            reviewedAt: true,
            createdAt: true,
          },
        },
        bankAccount: {
          select: {
            id: true,
            holderName: true,
            accountLast4: true,
            ifsc: true,
            upiId: true,
            verifiedAt: true,
          },
        },
        backgroundDeclarations: true,
        presence: true,
        bookings: {
          select: {
            id: true,
            code: true,
            status: true,
            estimatedTotalPaise: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        ledgerEntries: {
          select: {
            id: true,
            type: true,
            amountPaise: true,
            note: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 15,
        },
      },
    });

    if (!mechanic) {
      throw new NotFoundException(`Mechanic not found: ${id}`);
    }

    if (
      !scope.isSuperAdmin &&
      mechanic.areaId &&
      !scope.subtreeIds.includes(mechanic.areaId)
    ) {
      throw new ForbiddenException('Mechanic is outside authorized jurisdiction');
    }

    return mechanic;
  }

  async getKycQueue(scope: JurisdictionScopeContext) {
    const where: Prisma.MechanicWhereInput = {
      status: { in: [MechanicStatus.PENDING_KYC, MechanicStatus.UNDER_REVIEW] },
    };

    if (!scope.isSuperAdmin) {
      where.areaId = { in: scope.subtreeIds };
    }

    const items = await this.prisma.mechanic.findMany({
      where,
      include: {
        area: { select: { id: true, name: true } },
        profile: { select: { shopName: true, registrationType: true } },
        documents: { select: { id: true, docType: true, status: true } },
        backgroundDeclarations: { select: { id: true, hasYes: true, reviewStatus: true } },
      },
      orderBy: { createdAt: 'asc' }, // Oldest first
    });

    return items;
  }

  async reviewKyc(
    id: string,
    dto: ReviewKycDto,
    admin: AuthenticatedAdmin,
    scope: JurisdictionScopeContext,
  ) {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id },
      include: {
        documents: true,
        backgroundDeclarations: true,
      },
    });

    if (!mechanic) throw new NotFoundException('Mechanic not found');

    if (
      !scope.isSuperAdmin &&
      mechanic.areaId &&
      !scope.subtreeIds.includes(mechanic.areaId)
    ) {
      throw new ForbiddenException('Mechanic is outside authorized jurisdiction');
    }

    // Check background declaration restriction:
    // "Background 'Yes' needs SUB_DIVISIONAL or above"
    const hasBgYes = mechanic.backgroundDeclarations.some((bg) => bg.hasYes);
    if (hasBgYes && admin.role === 'AREA_ADMIN') {
      throw new ForbiddenException(
        "Mechanic declared affirmative 'Yes' on background questionnaire. Requires SUB_DIVISIONAL or above administrator review.",
      );
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      for (const doc of dto.documents) {
        await tx.mechanicDocument.update({
          where: { id: doc.docId },
          data: {
            status: doc.status as DocStatus,
            rejectionReason: doc.status === 'REJECTED_DOC' ? doc.rejectionReason : null,
            reviewedById: admin.id,
            reviewedAt: now,
          },
        });
      }

      if (dto.backgroundStatus && mechanic.backgroundDeclarations.length > 0) {
        for (const bg of mechanic.backgroundDeclarations) {
          await tx.mechanicBackgroundDeclaration.update({
            where: { id: bg.id },
            data: {
              reviewStatus: dto.backgroundStatus as BackgroundReviewStatus,
              reviewedById: admin.id,
            },
          });
        }
      }

      // Check overall verification
      const allDocs = await tx.mechanicDocument.findMany({ where: { mechanicId: id } });
      const hasRejection = allDocs.some((d) => d.status === DocStatus.REJECTED_DOC);
      const allApproved = allDocs.length > 0 && allDocs.every((d) => d.status === DocStatus.APPROVED_DOC);

      let nextStatus = mechanic.status;
      if (hasRejection) {
        nextStatus = MechanicStatus.REJECTED;
      } else if (allApproved) {
        nextStatus = MechanicStatus.APPROVED;
      } else {
        nextStatus = MechanicStatus.UNDER_REVIEW;
      }

      await tx.mechanic.update({
        where: { id },
        data: { status: nextStatus },
      });
    });

    await this.audit.log({
      actorId: admin.id,
      action: 'MECHANIC_KYC_REVIEW',
      entity: 'Mechanic',
      entityId: id,
      before: { status: mechanic.status },
      after: { documents: dto.documents, backgroundStatus: dto.backgroundStatus },
      reason: 'KYC document verification review',
    });

    return { message: 'KYC review recorded successfully' };
  }

  async suspend(
    id: string,
    dto: SuspendMechanicDto,
    admin: AuthenticatedAdmin,
    scope: JurisdictionScopeContext,
  ) {
    const mechanic = await this.prisma.mechanic.findUnique({ where: { id } });
    if (!mechanic) throw new NotFoundException('Mechanic not found');

    if (
      !scope.isSuperAdmin &&
      mechanic.areaId &&
      !scope.subtreeIds.includes(mechanic.areaId)
    ) {
      throw new ForbiddenException('Mechanic is outside authorized jurisdiction');
    }

    // Role check: AREA_ADMIN creates request, SUB_DIV+ executes directly
    if (admin.role === 'AREA_ADMIN') {
      const approvalRequest = await this.prisma.approvalRequest.create({
        data: {
          type: ApprovalRequestType.SUSPENSION_REQUEST,
          payload: {
            mechanicId: id,
            reason: dto.reason,
            durationDays: dto.durationDays,
          },
          jurisdictionId: mechanic.areaId || admin.jurisdictionId || 'global',
          requestedById: admin.id,
        },
      });

      await this.audit.log({
        actorId: admin.id,
        action: 'MECHANIC_SUSPENSION_REQUESTED',
        entity: 'Mechanic',
        entityId: id,
        reason: dto.reason,
      });

      return {
        message: 'Suspension approval request submitted to higher administrative tier',
        approvalRequestId: approvalRequest.id,
      };
    }

    // Execute suspension directly
    await this.prisma.mechanic.update({
      where: { id },
      data: {
        status: MechanicStatus.SUSPENDED,
        tokenVersion: { increment: 1 },
      },
    });

    // Revoke sessions
    await this.sessionService.revokeAllSessions(id, 'mechanic');

    await this.audit.log({
      actorId: admin.id,
      action: 'MECHANIC_SUSPEND',
      entity: 'Mechanic',
      entityId: id,
      before: { status: mechanic.status },
      after: { status: MechanicStatus.SUSPENDED, durationDays: dto.durationDays },
      reason: dto.reason,
    });

    return { message: 'Mechanic suspended successfully and sessions terminated' };
  }

  async reactivate(id: string, adminId: string, scope: JurisdictionScopeContext) {
    const mechanic = await this.prisma.mechanic.findUnique({ where: { id } });
    if (!mechanic) throw new NotFoundException('Mechanic not found');

    if (
      !scope.isSuperAdmin &&
      mechanic.areaId &&
      !scope.subtreeIds.includes(mechanic.areaId)
    ) {
      throw new ForbiddenException('Mechanic is outside authorized jurisdiction');
    }

    await this.prisma.mechanic.update({
      where: { id },
      data: { status: MechanicStatus.APPROVED },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'MECHANIC_REACTIVATE',
      entity: 'Mechanic',
      entityId: id,
      before: { status: mechanic.status },
      after: { status: MechanicStatus.APPROVED },
      reason: 'Admin reactivated mechanic account',
    });

    return { message: 'Mechanic reactivated successfully' };
  }

  async getDocumentSignedUrl(
    mechanicId: string,
    docId: string,
    adminId: string,
    scope: JurisdictionScopeContext,
  ) {
    const doc = await this.prisma.mechanicDocument.findFirst({
      where: { id: docId, mechanicId },
      include: { mechanic: true },
    });

    if (!doc) throw new NotFoundException('Document not found');

    if (
      !scope.isSuperAdmin &&
      doc.mechanic.areaId &&
      !scope.subtreeIds.includes(doc.mechanic.areaId)
    ) {
      throw new ForbiddenException('Resource is outside authorized jurisdiction');
    }

    // Signed viewing URL with 15-minute expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const signedUrl = `https://${process.env.STORAGE_BUCKET || 'gearzo-assets'}.s3.ap-south-1.amazonaws.com/${doc.fileKey}?token=${Buffer.from(docId).toString('base64')}&exp=${expiresAt}`;

    await this.audit.log({
      actorId: adminId,
      action: 'KYC_VIEW_FULL',
      entity: 'MechanicDocument',
      entityId: docId,
      reason: 'Admin viewed sensitive KYC document URL',
    });

    return {
      docId,
      docType: doc.docType,
      url: signedUrl,
      expiresAt,
    };
  }

  async forceLogout(id: string, adminId: string) {
    const mechanic = await this.prisma.mechanic.findUnique({ where: { id } });
    if (!mechanic) throw new NotFoundException('Mechanic not found');

    await this.prisma.mechanic.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });

    await this.sessionService.revokeAllSessions(id, 'mechanic');

    await this.audit.log({
      actorId: adminId,
      action: 'MECHANIC_FORCE_LOGOUT',
      entity: 'Mechanic',
      entityId: id,
      reason: 'Administrative session termination',
    });

    return { message: 'Mechanic logged out and sessions revoked' };
  }
}
