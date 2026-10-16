import { z } from 'zod';

export const customerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(4001),
  APP_AUDIENCE: z.literal('customer').default('customer'),
  API_PREFIX: z.string().default('api/v1'),

  // CORS
  ALLOWED_ORIGINS: z.string().default('https://customer.gearzo.in,https://staging-customer.gearzo.in,http://localhost:3000,http://localhost:8081'),

  // Database & Redis
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/gearzo?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Auth & JWT
  JWT_SECRET: z.string().min(16).default('development-secret-key-gearzo-customer-api-at-least-32-chars'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),

  // OTP
  OTP_PROVIDER: z.enum(['mock', 'sms', 'msg91', 'twilio']).default('mock'),
  ALLOW_MOCK_OTP_IN_PROD: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Payment
  PAYMENT_PROVIDER: z.enum(['razorpay', 'mock']).default('razorpay'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_secret_placeholder'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_test_webhook_secret'),

  // Storage
  STORAGE_PROVIDER: z.enum(['s3', 'mock']).default('s3'),
  STORAGE_BUCKET: z.string().default('gearzo-customer-assets'),
});

export type CustomerEnv = z.infer<typeof customerEnvSchema>;

export function validateEnv(): CustomerEnv {
  const result = customerEnvSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`Environment validation error: ${JSON.stringify(formatted, null, 2)}`);
  }
  return result.data;
}

export const env = validateEnv();
