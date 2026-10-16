const MIN = 60;
const DAY = 86_400;

export const LIMITS = {
  'session.customer.accessTtlSec': { default: 15 * MIN, min: 5 * MIN, max: 30 * MIN },
  'session.customer.idleTimeoutSec': { default: 30 * DAY, min: 1 * DAY, max: 60 * DAY },
  'session.customer.absoluteTimeoutSec': { default: 90 * DAY, min: 7 * DAY, max: 180 * DAY },
  'session.customer.maxSessions': { default: 5, min: 1, max: 10 },
  'session.mechanic.accessTtlSec': { default: 15 * MIN, min: 5 * MIN, max: 30 * MIN },
  'session.mechanic.idleTimeoutSec': { default: 15 * DAY, min: 1 * DAY, max: 30 * DAY },
  'session.mechanic.absoluteTimeoutSec': { default: 60 * DAY, min: 7 * DAY, max: 90 * DAY },
  'session.mechanic.maxSessions': { default: 2, min: 1, max: 3 },
  'session.admin.accessTtlSec': { default: 10 * MIN, min: 5 * MIN, max: 15 * MIN },
  'session.admin.idleTimeoutSec': { default: 30 * MIN, min: 5 * MIN, max: 60 * MIN },
  'session.admin.absoluteTimeoutSec': { default: 12 * 3600, min: 1 * 3600, max: 24 * 3600 },
  'session.admin.maxSessions': { default: 2, min: 1, max: 3 },
  'otp.ttlSec': { default: 300, min: 120, max: 600 },
  'otp.maxVerifyAttempts': { default: 5, min: 3, max: 10 },
  'otp.resendCooldownSec': { default: 30, min: 15, max: 120 },
  'otp.sendPerPhone15m': { default: 3, min: 1, max: 5 },
  'otp.sendPerPhoneDay': { default: 10, min: 3, max: 20 },
  'otp.sendPerIp15m': { default: 10, min: 3, max: 50 },
  'admin.maxFailedAttempts': { default: 5, min: 3, max: 10 },
  'admin.lockDurationSec': { default: 15 * MIN, min: 5 * MIN, max: 60 * MIN },
} as const;

export type LimitKey = keyof typeof LIMITS;
