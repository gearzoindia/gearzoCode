import { z } from 'zod';
import { phoneSchema } from './auth';
import { uuidParam } from './common';

export const mechanicRegistrationTypeEnum = z.enum(['SHOP', 'INDIVIDUAL', 'DIRECT_JOB']);

export const onboardingTypeSchema = z.object({
  registrationType: mechanicRegistrationTypeEnum,
});

export const profileStepSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain letters, spaces, and dots'),
    registrationType: mechanicRegistrationTypeEnum,
    shopName: z.string().max(100).optional(),
    shopCapacity: z.number().int().min(1).max(50).optional(),
    serviceModes: z.array(z.string()).min(1, 'At least one service mode must be selected'),
    experienceYears: z.number().int().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years'),
    languages: z.array(z.string()).min(1, 'At least one language must be specified'),
    alternatePhone: phoneSchema.optional(),
    dob: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD')
      .refine(
        (val) => {
          const birthDate = new Date(val);
          if (isNaN(birthDate.getTime())) return false;
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= 18;
        },
        { message: 'Mechanic must be at least 18 years old' }
      ),
  })
  .refine(
    (data) => {
      if (data.registrationType === 'SHOP') {
        return Boolean(data.shopName && data.shopName.trim().length > 0);
      }
      return true;
    },
    {
      message: 'Shop name is required for SHOP registration type',
      path: ['shopName'],
    }
  );

export const skillsSchema = z.object({
  vehicleTypes: z.array(z.enum(['TWO_WHEELER', 'FOUR_WHEELER', 'COMMERCIAL'])).min(1, 'At least one vehicle type must be selected'),
  serviceIds: z.array(uuidParam).min(1, 'At least one service must be selected'),
  brandIds: z.array(uuidParam).optional(),
  equipment: z.array(z.string()).default([]),
});

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusKm: z.union([z.literal(3), z.literal(5), z.literal(10)]),
});

export const bankSchema = z
  .object({
    holderName: z.string().min(2, 'Account holder name is required').max(100),
    accountNumber: z.string().min(9).max(18).regex(/^\d+$/, 'Account number must contain only digits').optional(),
    ifsc: z
      .string()
      .toUpperCase()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid Indian IFSC code format (e.g. SBIN0001234)')
      .optional(),
    upiId: z
      .string()
      .regex(/^[\w.-]+@[\w]+$/, 'Invalid UPI ID format (e.g. name@bank)')
      .optional(),
  })
  .refine(
    (data) => Boolean((data.accountNumber && data.ifsc) || data.upiId),
    {
      message: 'Either Bank Account with IFSC or UPI ID must be provided',
      path: ['upiId'],
    }
  );

export const presenceLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().nonnegative().optional(),
  ts: z.string().datetime({ message: 'Timestamp must be an ISO-8601 string' }),
});

export const extraItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100),
  type: z.enum(['PART', 'LABOUR']),
  pricePaise: z.number().int().positive('Price must be positive in paise'),
  qty: z.number().int().min(1).max(10),
  photoKey: z.string().optional(),
});

export const paymentReceivedSchema = z.object({
  method: z.enum(['CASH', 'UPI_DIRECT']),
});

export type OnboardingTypeInput = z.infer<typeof onboardingTypeSchema>;
export type ProfileStepInput = z.infer<typeof profileStepSchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
export type MechanicLocationInput = z.infer<typeof locationSchema>;
export type BankInput = z.infer<typeof bankSchema>;
export type PresenceLocationInput = z.infer<typeof presenceLocationSchema>;
export type ExtraItemInput = z.infer<typeof extraItemSchema>;
export type PaymentReceivedInput = z.infer<typeof paymentReceivedSchema>;
