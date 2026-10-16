import { z } from 'zod';

export const adminEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(4003),
  APP_AUDIENCE: z.literal('admin').default('admin'),
  API_PREFIX: z.string().default('v1'),

  // CORS
  ALLOWED_ORIGINS: z
    .string()
    .default(
      'https://admin.gearzo.in,https://staging-admin.gearzo.in,http://localhost:3000,http://localhost:3002',
    ),

  // Database & Redis
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://postgres:postgres@localhost:5432/gearzo?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Auth & JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(16)
    .default('development-secret-key-gearzo-admin-api-at-least-32-chars-length'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),

  // 2FA / TOTP AES-256 Key
  TOTP_ENC_KEY: z
    .string()
    .min(16)
    .default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),

  // OTP
  OTP_PROVIDER: z.enum(['mock', 'sms', 'msg91', 'twilio']).default('mock'),
  ALLOW_MOCK_OTP_IN_PROD: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Storage
  STORAGE_PROVIDER: z.enum(['s3', 'mock']).default('s3'),
  STORAGE_BUCKET: z.string().default('gearzo-admin-assets'),
  STORAGE_REGION: z.string().default('ap-south-1'),
});

export type AdminEnv = z.infer<typeof adminEnvSchema>;

export function validateEnv(): AdminEnv {
  const result = adminEnvSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`Environment validation error: ${JSON.stringify(formatted, null, 2)}`);
  }
  return result.data;
}

export const env = validateEnv();
