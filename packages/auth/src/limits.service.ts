import { Injectable, Optional } from '@nestjs/common';
import { LIMITS, LimitKey } from './limits.config';
import { prisma, PrismaClient } from '@gearzo/db';

interface CacheEntry {
  value: number;
  expiresAt: number;
}

@Injectable()
export class LimitsService {
  private readonly cache = new Map<LimitKey, CacheEntry>();
  private readonly CACHE_TTL_MS = 60_000; // 60 seconds

  constructor(
    @Optional()
    private readonly dbClient?: PrismaClient,
  ) {}

  private get client(): PrismaClient {
    return this.dbClient ?? prisma;
  }

  async get(key: LimitKey): Promise<number> {
    const cached = this.cache.get(key);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const config = LIMITS[key];
    let resolvedValue: number | undefined;

    // 1. Try resolving from system_settings in DB
    try {
      // System setting table lookup if available
      const setting = await (this.client as any).systemSetting?.findUnique?.({
        where: { key },
      });
      if (setting && setting.value !== undefined && setting.value !== null) {
        const parsed = Number(setting.value);
        if (!Number.isNaN(parsed)) {
          resolvedValue = parsed;
        }
      }
    } catch {
      // Fall through to env / code defaults if DB is unavailable or table not created yet
    }

    // 2. Try resolving from environment variable
    if (resolvedValue === undefined) {
      // key format: 'session.admin.idleTimeoutSec' -> 'LIMIT_SESSION_ADMIN_IDLE_TIMEOUT_SEC'
      const envKey = `LIMIT_${key.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
      const envVal = process.env[envKey];
      if (envVal !== undefined && envVal !== '') {
        const parsed = Number(envVal);
        if (!Number.isNaN(parsed)) {
          resolvedValue = parsed;
        }
      }
    }

    // 3. Fallback to code default
    if (resolvedValue === undefined) {
      resolvedValue = config.default;
    }

    // Clamp between min and max
    const clampedValue = Math.min(Math.max(resolvedValue, config.min), config.max);

    this.cache.set(key, {
      value: clampedValue,
      expiresAt: now + this.CACHE_TTL_MS,
    });

    return clampedValue;
  }

  invalidate(key?: LimitKey): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}
