import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
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
  constructor(
    private readonly jwtService: JwtService,
    private readonly limitsService: LimitsService,
    @Optional()
    private readonly dbClient?: PrismaClient,
  ) {}

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
      const record = await sessionDelegate.create({
        data: {
          subjectId,
          audience,
          refreshToken,
          device,
          ipAddress: ip,
          userAgent,
          lastActiveAt: now,
          idleExpiresAt,
          absoluteExpiresAt,
          revoked: false,
        },
      });
      sessionId = record.id;
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
    if (!sessionDelegate?.findFirst) {
      throw new UnauthorizedException('Session service unavailable');
    }

    const session = await sessionDelegate.findFirst({
      where: {
        refreshToken: refreshTokenValue,
        audience,
      },
    });

    if (!session) {
      // Check if this token was already replaced or revoked - REUSE DETECTION
      const reusedSession = await sessionDelegate.findFirst({
        where: {
          previousRefreshToken: refreshTokenValue,
        },
      });

      if (reusedSession) {
        // Token reuse detected! Revoke all sessions for this subject to protect account
        await this.revokeAllSessions(reusedSession.subjectId, reusedSession.audience);
        throw new UnauthorizedException('Security alert: Refresh token reuse detected. All sessions terminated.');
      }

      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.revoked) {
      throw new UnauthorizedException('Session has been revoked');
    }

    const now = new Date();

    if (new Date(session.idleExpiresAt) < now || new Date(session.absoluteExpiresAt) < now) {
      await sessionDelegate.update({
        where: { id: session.id },
        data: { revoked: true, revokedAt: now, revokeReason: 'EXPIRED' },
      });
      throw new UnauthorizedException('Session has expired');
    }

    // Rotate refresh token
    const newRefreshToken = this.generateToken();
    const [accessTtlSec, idleTimeoutSec] = await Promise.all([
      this.limitsService.get(this.getLimitKey(audience, 'accessTtlSec')),
      this.limitsService.get(this.getLimitKey(audience, 'idleTimeoutSec')),
    ]);

    const newIdleExpiresAt = new Date(now.getTime() + idleTimeoutSec * 1000);

    await sessionDelegate.update({
      where: { id: session.id },
      data: {
        previousRefreshToken: refreshTokenValue,
        refreshToken: newRefreshToken,
        lastActiveAt: now,
        idleExpiresAt: newIdleExpiresAt,
        ipAddress: ip ?? session.ipAddress,
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
      await sessionDelegate.update({
        where: { id: sessionId },
        data: {
          revoked: true,
          revokedAt: new Date(),
          revokeReason: 'USER_LOGOUT',
        },
      });
    }
  }

  async revokeAllSessions(subjectId: string, audience: string): Promise<void> {
    const sessionDelegate = (this.client as any).session;
    const now = new Date();

    if (sessionDelegate?.updateMany) {
      await sessionDelegate.updateMany({
        where: {
          subjectId,
          audience,
          revoked: false,
        },
        data: {
          revoked: true,
          revokedAt: now,
          revokeReason: 'REVOKE_ALL',
        },
      });
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
        audience,
        revoked: false,
        idleExpiresAt: { gt: new Date() },
        absoluteExpiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        device: true,
        ipAddress: true,
        userAgent: true,
        lastActiveAt: true,
        createdAt: true,
      },
      orderBy: { lastActiveAt: 'desc' },
    });
  }

  async enforceSessionLimit(subjectId: string, audience: string): Promise<void> {
    const maxSessions = await this.limitsService.get(this.getLimitKey(audience, 'maxSessions'));
    const sessionDelegate = (this.client as any).session;

    if (!sessionDelegate?.findMany) return;

    const activeSessions = await sessionDelegate.findMany({
      where: {
        subjectId,
        audience,
        revoked: false,
        idleExpiresAt: { gt: new Date() },
        absoluteExpiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: 'asc' }, // Oldest first
    });

    if (activeSessions.length >= maxSessions) {
      const excessCount = activeSessions.length - maxSessions + 1;
      const toEvict = activeSessions.slice(0, excessCount);

      const evictIds = toEvict.map((s: any) => s.id);
      await sessionDelegate.updateMany({
        where: { id: { in: evictIds } },
        data: {
          revoked: true,
          revokedAt: new Date(),
          revokeReason: 'CONCURRENT_LIMIT_EXCEEDED',
        },
      });
    }
  }
}
