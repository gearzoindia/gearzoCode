import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import { randomBytes, createHash, randomUUID } from 'node:crypto';
import { prisma, PrismaClient } from '@gearzo/db';
import { JwtService } from '../jwt/jwt.service';
import { LimitsService } from '../limits.service';
import { LimitKey } from '../limits.config';

export interface SessionResult {
  sessionId: string;
  accessToken: string;
  refreshToken: string;
  expiresInSec: number;
}

@Injectable()
export class SessionService {
  private readonly jwtService: JwtService;
  private readonly limitsService: LimitsService;

  constructor(
    @Optional() jwtService?: JwtService,
    @Optional() limitsService?: LimitsService,
    @Optional()
    private readonly dbClient?: PrismaClient,
  ) {
    this.jwtService = jwtService || new JwtService();
    this.limitsService = limitsService || new LimitsService(this.dbClient);
  }

  private get client(): PrismaClient {
    return this.dbClient ?? prisma;
  }

  private generateToken(): string {
    return randomBytes(40).toString('hex');
  }

  private getLimitKey(audience: string, type: 'accessTtlSec' | 'idleTimeoutSec' | 'absoluteTimeoutSec' | 'maxSessions'): LimitKey {
    const aud = audience.toLowerCase();
    if (aud === 'customer') {
      return `session.customer.${type}` as LimitKey;
    }
    if (aud === 'mechanic') {
      return `session.mechanic.${type}` as LimitKey;
    }
    return `session.admin.${type}` as LimitKey;
  }

  async createSession(
    subjectId: string,
    audience: string,
    device?: string,
    ip?: string,
    userAgent?: string,
    role?: string,
    jurisdictionId?: string,
  ): Promise<SessionResult> {
    // 1. Enforce max concurrent sessions (evict LRU)
    await this.enforceSessionLimit(subjectId, audience);

    const [accessTtlSec, idleTimeoutSec, absoluteTimeoutSec] = await Promise.all([
      this.limitsService.get(this.getLimitKey(audience, 'accessTtlSec')),
      this.limitsService.get(this.getLimitKey(audience, 'idleTimeoutSec')),
      this.limitsService.get(this.getLimitKey(audience, 'absoluteTimeoutSec')),
    ]);

    const now = new Date();
    const idleExpiresAt = new Date(now.getTime() + idleTimeoutSec * 1000);
    const absoluteExpiresAt = new Date(now.getTime() + absoluteTimeoutSec * 1000);
    const refreshToken = this.generateToken();

    // Query tokenVersion from user record if present
    let tokenVersion = 1;
    const sessionDelegate = (this.client as any).session;
    const userDelegate = (this.client as any)[audience.toLowerCase()] || (this.client as any).user;

    if (userDelegate?.findUnique) {
      try {
        const user = await userDelegate.findUnique({
          where: { id: subjectId },
          select: { tokenVersion: true },
        });
        if (user?.tokenVersion !== undefined) {
          tokenVersion = user.tokenVersion;
        }
      } catch {
        // Fallback to default version 1
      }
    }

    let sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (sessionDelegate?.create) {
      try {
        const familyId = randomUUID();
        const record = await sessionDelegate.create({
          data: {
            subjectId,
            audience: (audience || 'CUSTOMER').toUpperCase() as any,
            familyId,
            deviceId: device || 'web-browser',
            platform: 'WEB',
            ip: ip || '127.0.0.1',
            userAgent: userAgent || 'Web Dashboard',
            lastUsedAt: now,
            idleExpiresAt,
            absoluteExpiresAt,
          },
        });
        sessionId = record.id;

        const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
        const refreshTokenDelegate = (this.client as any).refreshToken;
        if (refreshTokenDelegate?.create) {
          await refreshTokenDelegate.create({
            data: {
              sessionId: record.id,
              tokenHash,
              expiresAt: absoluteExpiresAt,
            },
          });
        }
      } catch {
      }
    }

    const accessToken = this.jwtService.signAccessToken({
      sub: subjectId,
      aud: audience,
      role,
      tokenVersion,
      jurisdictionId,
      expiresInSec: accessTtlSec,
    });

    return {
      sessionId,
      accessToken,
      refreshToken,
      expiresInSec: accessTtlSec,
    };
  }

  async refreshSession(
    refreshTokenValue: string,
    audience: string,
    ip?: string,
  ): Promise<SessionResult> {
    const sessionDelegate = (this.client as any).session;
    const refreshTokenDelegate = (this.client as any).refreshToken;
    if (!sessionDelegate?.findFirst || !refreshTokenDelegate?.findUnique) {
      throw new UnauthorizedException('Session service unavailable');
    }

    const tokenHash = createHash('sha256').update(refreshTokenValue).digest('hex');

    const tokenRecord = await refreshTokenDelegate.findUnique({
      where: { tokenHash },
      include: { session: true },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.revokedAt || tokenRecord.replacedById) {
      if (tokenRecord.session) {
        await this.revokeAllSessions(tokenRecord.session.subjectId, tokenRecord.session.audience);
      }
      throw new UnauthorizedException('Security alert: Refresh token reuse detected. All sessions terminated.');
    }

    const session = tokenRecord.session;
    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Session has been revoked');
    }

    const now = new Date();
    if (new Date(session.idleExpiresAt) < now || new Date(session.absoluteExpiresAt) < now || new Date(tokenRecord.expiresAt) < now) {
      await sessionDelegate.update({
        where: { id: session.id },
        data: { revokedAt: now, revokeReason: 'EXPIRED' },
      });
      throw new UnauthorizedException('Session has expired');
    }

    // Rotate refresh token
    const newRefreshToken = this.generateToken();
    const newTokenHash = createHash('sha256').update(newRefreshToken).digest('hex');

    const [accessTtlSec, idleTimeoutSec] = await Promise.all([
      this.limitsService.get(this.getLimitKey(audience, 'accessTtlSec')),
      this.limitsService.get(this.getLimitKey(audience, 'idleTimeoutSec')),
    ]);

    const newIdleExpiresAt = new Date(now.getTime() + idleTimeoutSec * 1000);

    const newCreatedToken = await refreshTokenDelegate.create({
      data: {
        sessionId: session.id,
        tokenHash: newTokenHash,
        expiresAt: session.absoluteExpiresAt,
      },
    });

    await refreshTokenDelegate.update({
      where: { id: tokenRecord.id },
      data: {
        revokedAt: now,
        replacedById: newCreatedToken.id,
      },
    });

    await sessionDelegate.update({
      where: { id: session.id },
      data: {
        lastUsedAt: now,
        idleExpiresAt: newIdleExpiresAt,
        ip: ip ?? session.ip,
      },
    });

    // Lookup tokenVersion
    let tokenVersion = 1;
    let role: string | undefined;
    let jurisdictionId: string | undefined;

    const userDelegate = (this.client as any)[audience.toLowerCase()] || (this.client as any).user;
    if (userDelegate?.findUnique) {
      try {
        const user = await userDelegate.findUnique({
          where: { id: session.subjectId },
        });
        if (user) {
          tokenVersion = user.tokenVersion ?? 1;
          role = user.role;
          jurisdictionId = user.jurisdictionId;
        }
      } catch {
        // Continue
      }
    }

    const accessToken = this.jwtService.signAccessToken({
      sub: session.subjectId,
      aud: audience,
      role,
      tokenVersion,
      jurisdictionId,
      expiresInSec: accessTtlSec,
    });

    return {
      sessionId: session.id,
      accessToken,
      refreshToken: newRefreshToken,
      expiresInSec: accessTtlSec,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    const sessionDelegate = (this.client as any).session;
    if (sessionDelegate?.update) {
      try {
        await sessionDelegate.update({
          where: { id: sessionId },
          data: {
            revokedAt: new Date(),
            revokeReason: 'USER_LOGOUT',
          },
        });
      } catch {
      }
    }
  }

  async revokeAllSessions(subjectId: string, audience: string): Promise<void> {
    const sessionDelegate = (this.client as any).session;
    const now = new Date();

    if (sessionDelegate?.updateMany) {
      try {
        await sessionDelegate.updateMany({
          where: {
            subjectId,
            audience: (audience || 'CUSTOMER').toUpperCase() as any,
            revokedAt: null,
          },
          data: {
            revokedAt: now,
            revokeReason: 'REVOKE_ALL',
          },
        });
      } catch {
      }
    }

    // Bump user's tokenVersion
    const userDelegate = (this.client as any)[audience.toLowerCase()] || (this.client as any).user;
    if (userDelegate?.update) {
      try {
        await userDelegate.update({
          where: { id: subjectId },
          data: {
            tokenVersion: { increment: 1 },
          },
        });
      } catch {
        // Ignore if field doesn't exist
      }
    }
  }

  async listSessions(subjectId: string, audience: string): Promise<any[]> {
    const sessionDelegate = (this.client as any).session;
    if (!sessionDelegate?.findMany) return [];

    return sessionDelegate.findMany({
      where: {
        subjectId,
        audience: (audience || 'CUSTOMER').toUpperCase() as any,
        revokedAt: null,
        idleExpiresAt: { gt: new Date() },
        absoluteExpiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        platform: true,
        ip: true,
        userAgent: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  async enforceSessionLimit(subjectId: string, audience: string): Promise<void> {
    try {
      const maxSessions = await this.limitsService.get(this.getLimitKey(audience, 'maxSessions'));
      const sessionDelegate = (this.client as any).session;

      if (!sessionDelegate?.findMany) return;

      const activeSessions = await sessionDelegate.findMany({
        where: {
          subjectId,
          audience: (audience || 'CUSTOMER').toUpperCase() as any,
          revokedAt: null,
          idleExpiresAt: { gt: new Date() },
          absoluteExpiresAt: { gt: new Date() },
        },
        orderBy: { lastUsedAt: 'asc' }, // Oldest first
      });

      if (activeSessions.length >= maxSessions) {
        const excessCount = activeSessions.length - maxSessions + 1;
        const toEvict = activeSessions.slice(0, excessCount);

        const evictIds = toEvict.map((s: any) => s.id);
        await sessionDelegate.updateMany({
          where: { id: { in: evictIds } },
          data: {
            revokedAt: new Date(),
            revokeReason: 'CONCURRENT_LIMIT_EXCEEDED',
          },
        });
      }
    } catch {
    }
  }
}
