import { z } from 'zod';

// Indian mobile → E.164
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91|91)?[6-9]\d{9}$/, 'Invalid Indian mobile number')
  .transform((val) => {
    const digits = val.replace(/\D/g, '');
    const last10 = digits.slice(-10);
    return `+91${last10}`;
  });

export const otpSchema = z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits');

export const startOtpSchema = z.string().length(4).regex(/^\d{4}$/, 'Start OTP must be 4 digits');

export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128)
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[0-9]/, 'Must contain a number');

export const emailSchema = z.string().email().toLowerCase().trim();

export const deviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100).optional(),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']),
});

export type Phone = z.output<typeof phoneSchema>;
export type Device = z.infer<typeof deviceSchema>;
