import { z } from 'zod';

export const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_AUDIENCE: z.enum(['customer', 'mechanic', 'admin']),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid database connection URL'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters long'),
  CORS_ORIGINS: z.string().min(1, 'CORS_ORIGINS is required (comma-separated URLs)'),
  REDIS_URL: z
    .string()
    .url('REDIS_URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  OTP_PROVIDER: z.enum(['mock', 'msg91']).default('mock'),
  MOCK_OTP_CODE: z.string().length(6, 'MOCK_OTP_CODE must be 6 digits').default('123456'),
  ALLOW_MOCK_OTP_IN_PROD: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        return val.toLowerCase() === 'true' || val === '1';
      }
      return Boolean(val);
    }, z.boolean())
    .default(false),
  OTP_PEPPER: z
    .string()
    .min(16, 'OTP_PEPPER must be at least 16 characters for secure hashing'),
  STORAGE_PROVIDER: z.enum(['cloudinary', 's3']).default('cloudinary'),
  REALTIME_PROVIDER: z.enum(['pusher', 'ably', 'socketio']).default('pusher'),
  SENTRY_DSN: z
    .string()
    .url('SENTRY_DSN must be a valid URL')
    .optional()
    .or(z.literal('')),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export function validateEnv<T extends z.ZodSchema = typeof baseEnvSchema>(
  schema: T = baseEnvSchema as unknown as T,
  env: Record<string, unknown> = process.env,
): z.infer<T> {
  const result = schema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `  - ${err.path.join('.') || 'root'}: ${err.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errorDetails}`);
  }
  return result.data;
}
