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
  QueryAdminsDto,
  InviteAdminDto,
  UpdateAdminDto,
  DisableAdminDto,
} from './dto';
import { JurisdictionScopeContext, AuthenticatedAdmin } from '../../common/guards';
import { AdminRole, AdminStatus, Prisma } from '@gearzo/db';
import { generateRandomToken, hashSha256 } from '@gearzo/utils';
import * as argon2 from 'argon2';

const ROLE_RANK: Record<string, number> = {
  AREA_ADMIN: 1,
  SUB_DIVISIONAL_ADMIN: 2,
  DIVISIONAL_ADMIN: 3,
  SUPER_ADMIN: 4,
};

@Injectable()
export class AdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly sessionService: SessionService,
  ) {}

  async findAll(dto: QueryAdminsDto, currentAdmin: AuthenticatedAdmin, scope: JurisdictionScopeContext) {
    const currentRank = ROLE_RANK[currentAdmin.role] || 0;

    const where: Prisma.AdminWhereInput = {};

    // Only lower roles in own subtree
    if (!scope.isSuperAdmin) {
      where.jurisdictionId = { in: scope.subtreeIds };
      where.id = { not: currentAdmin.id };
    }

    if (dto.role) {
      where.role = dto.role;
    }

    if (dto.jurisdictionId) {
      where.jurisdictionId = dto.jurisdictionId;
    }

    const admins = await this.prisma.admin.findMany({
      where,
      include: {
        jurisdiction: { select: { id: true, name: true, level: true } },
        creator: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter to only lower roles (Super admin sees all)
    return admins.filter(
      (a) => scope.isSuperAdmin || (ROLE_RANK[a.role] || 0) < currentRank,
    );
  }

  async findOne(id: string, currentAdmin: AuthenticatedAdmin, scope: JurisdictionScopeContext) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      include: {
        jurisdiction: { select: { id: true, name: true, level: true } },
        creator: { select: { id: true, name: true, role: true } },
        permissionOverrides: true,
      },
    });

    if (!admin) {
      throw new NotFoundException(`Administrator not found: ${id}`);
    }

    const currentRank = ROLE_RANK[currentAdmin.role] || 0;
    if (!scope.isSuperAdmin && (ROLE_RANK[admin.role] || 0) >= currentRank && admin.id !== currentAdmin.id) {
      throw new ForbiddenException('Cannot inspect higher or equal rank administrator');
    }

    return admin;
  }

  async invite(dto: InviteAdminDto, currentAdmin: AuthenticatedAdmin, scope: JurisdictionScopeContext) {
    const currentRank = ROLE_RANK[currentAdmin.role] || 0;
    const targetRank = ROLE_RANK[dto.role] || 0;

    // Role must be strictly lower
    if (targetRank >= currentRank && currentAdmin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'You can only invite administrators with a role strictly lower than your own.',
      );
    }

    // Jurisdiction inside own subtree
    if (!scope.isSuperAdmin && !scope.subtreeIds.includes(dto.jurisdictionId)) {
      throw new ForbiddenException('Target jurisdiction is outside authorized subtree');
    }

    // Check unique email / phone
    const existing = await this.prisma.admin.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }],
      },
    });
    if (existing) {
      throw new BadRequestException('An administrator with this email or phone already exists');
    }

    const inviteToken = generateRandomToken();
    const tokenHash = hashSha256(inviteToken);
    const placeholderHash = await argon2.hash(generateRandomToken());

    const result = await this.prisma.$transaction(async (tx) => {
      const admin = await tx.admin.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          email: dto.email.toLowerCase(),
          role: dto.role,
          jurisdictionId: dto.jurisdictionId,
          passwordHash: placeholderHash,
          status: AdminStatus.INVITED,
          mustChangePassword: true,
          createdById: currentAdmin.id,
        },
      });

      const invite = await tx.adminInvite.create({
        data: {
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          role: dto.role,
          jurisdictionId: dto.jurisdictionId,
          tokenHash,
          invitedById: currentAdmin.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return { admin, invite };
    });

    await this.audit.log({
      actorId: currentAdmin.id,
      action: 'ADMIN_INVITE',
      entity: 'Admin',
      entityId: result.admin.id,
      after: { email: dto.email, role: dto.role, jurisdictionId: dto.jurisdictionId },
      reason: 'Administrator onboarding invitation issued',
    });

    const inviteUrl = `https://admin.gearzo.in/setup-password?token=${inviteToken}`;

    return {
      adminId: result.admin.id,
      inviteToken,
      inviteUrl,
      expiresAt: result.invite.expiresAt,
      message: 'Admin invite created successfully.',
    };
  }

  async update(
    id: string,
    dto: UpdateAdminDto,
    currentAdmin: AuthenticatedAdmin,
    scope: JurisdictionScopeContext,
  ) {
    if (id === currentAdmin.id) {
      throw new BadRequestException('You cannot modify your own role or jurisdiction');
    }

    const target = await this.prisma.admin.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Administrator not found');

    const currentRank = ROLE_RANK[currentAdmin.role] || 0;
    const targetRank = ROLE_RANK[target.role] || 0;

    if (targetRank >= currentRank && currentAdmin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot modify an administrator with equal or higher rank');
    }

    if (dto.role) {
      const newRank = ROLE_RANK[dto.role] || 0;
      if (newRank >= currentRank && currentAdmin.role !== AdminRole.SUPER_ADMIN) {
        throw new ForbiddenException('Cannot assign a role equal to or higher than your own');
      }
    }

    if (dto.jurisdictionId && !scope.isSuperAdmin) {
      if (!scope.subtreeIds.includes(dto.jurisdictionId)) {
        throw new ForbiddenException('Target jurisdiction is outside authorized subtree');
      }
    }

    const updated = await this.prisma.admin.update({
      where: { id },
      data: {
        role: dto.role,
        jurisdictionId: dto.jurisdictionId,
        tokenVersion: { increment: 1 }, // Forces logout on change
      },
    });

    await this.sessionService.revokeAllSessions(id, 'admin');

    await this.audit.log({
      actorId: currentAdmin.id,
      action: 'ADMIN_UPDATE',
      entity: 'Admin',
      entityId: id,
      before: { role: target.role, jurisdictionId: target.jurisdictionId },
      after: { role: dto.role, jurisdictionId: dto.jurisdictionId },
      reason: 'Administrative scope or role alteration',
    });

    return updated;
  }

  async disable(id: string, dto: DisableAdminDto, currentAdmin: AuthenticatedAdmin) {
    if (id === currentAdmin.id) {
      throw new BadRequestException('You cannot disable your own account');
    }

    const target = await this.prisma.admin.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Administrator not found');

    // Cannot disable last Super Admin
    if (target.role === AdminRole.SUPER_ADMIN) {
      const superAdminCount = await this.prisma.admin.count({
        where: { role: AdminRole.SUPER_ADMIN, status: AdminStatus.ACTIVE },
      });
      if (superAdminCount <= 1) {
        throw new BadRequestException('Cannot disable the last active Super Administrator');
      }
    }

    await this.prisma.admin.update({
      where: { id },
      data: {
        status: AdminStatus.DISABLED,
        tokenVersion: { increment: 1 },
      },
    });

    await this.sessionService.revokeAllSessions(id, 'admin');

    await this.audit.log({
      actorId: currentAdmin.id,
      action: 'ADMIN_DISABLE',
      entity: 'Admin',
      entityId: id,
      reason: dto.reason,
    });

    return { message: 'Administrator account disabled and sessions terminated' };
  }

  async enable(id: string, currentAdmin: AuthenticatedAdmin) {
    const target = await this.prisma.admin.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Administrator not found');

    await this.prisma.admin.update({
      where: { id },
      data: { status: AdminStatus.ACTIVE },
    });

    await this.audit.log({
      actorId: currentAdmin.id,
      action: 'ADMIN_ENABLE',
      entity: 'Admin',
      entityId: id,
      reason: 'Administrator account re-enabled',
    });

    return { message: 'Administrator account enabled' };
  }

  async reset2fa(id: string, currentAdmin: AuthenticatedAdmin) {
    const target = await this.prisma.admin.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Administrator not found');

    const currentRank = ROLE_RANK[currentAdmin.role] || 0;
    const targetRank = ROLE_RANK[target.role] || 0;

    if (targetRank >= currentRank && currentAdmin.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only a higher-tier administrator can reset 2FA');
    }

    await this.prisma.admin.update({
      where: { id },
      data: {
        totpSecretEnc: null,
        totpEnabled: false,
        tokenVersion: { increment: 1 },
      },
    });

    await this.sessionService.revokeAllSessions(id, 'admin');

    await this.audit.log({
      actorId: currentAdmin.id,
      action: 'ADMIN_RESET_2FA',
      entity: 'Admin',
      entityId: id,
      reason: 'Administrator 2FA credentials cleared by supervisor',
    });

    return { message: '2FA reset successfully. Administrator must re-enroll on next login.' };
  }

  async revokeSessions(id: string, currentAdmin: AuthenticatedAdmin) {
    const target = await this.prisma.admin.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Administrator not found');

    await this.prisma.admin.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });

    await this.sessionService.revokeAllSessions(id, 'admin');

    await this.audit.log({
      actorId: currentAdmin.id,
      action: 'ADMIN_FORCE_LOGOUT',
      entity: 'Admin',
      entityId: id,
      reason: 'Force session invalidation',
    });

    return { message: 'All sessions for administrator revoked successfully' };
  }
}
