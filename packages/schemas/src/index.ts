import { z } from 'zod';

// ==================== Common & Primitives ====================

export const phoneSchema = z
  .string()
  .regex(/^\+91[6-9]\d{9}$/, 'Must be a valid 10-digit Indian phone number starting with +91');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must be numeric');

export const paiseSchema = z.number().int().nonnegative('Amount in paise must be positive integer');

export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// ==================== Auth Schemas ====================

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});
export type SendOtpInput = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const registerCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  city: z.string().min(2, 'City must be at least 2 characters').optional().or(z.literal('')),
});
export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const adminTotpSchema = z.object({
  code: z.string().length(6, 'TOTP code must be 6 digits'),
});
export type AdminTotpInput = z.infer<typeof adminTotpSchema>;

// ==================== User & Profile ====================

export interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  city?: string;
  role: 'CUSTOMER' | 'MECHANIC' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
  isNewUser?: boolean;
}

// ==================== Vehicle Schemas ====================

export const vehicleTypeEnum = z.enum(['TWO_WHEELER', 'FOUR_WHEELER', 'COMMERCIAL']);
export type VehicleType = z.infer<typeof vehicleTypeEnum>;

export const vehicleFuelEnum = z.enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID']);
export type VehicleFuel = z.infer<typeof vehicleFuelEnum>;

export const addVehicleSchema = z.object({
  type: vehicleTypeEnum,
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  registrationNumber: z
    .string()
    .min(5, 'Invalid registration number')
    .max(15, 'Invalid registration number')
    .toUpperCase(),
  fuelType: vehicleFuelEnum,
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  isDefault: z.boolean().default(false),
});
export type AddVehicleInput = z.infer<typeof addVehicleSchema>;

export interface Vehicle {
  id: string;
  userId: string;
  type: VehicleType;
  brand: string;
  model: string;
  registrationNumber: string;
  fuelType: VehicleFuel;
  year: number;
  isDefault: boolean;
  createdAt: string;
}

// ==================== Service Schemas ====================

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  description?: string;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  basePricePaise: number;
  pricePaise?: number;
  vehicleTypes: VehicleType[];
  includedFeatures: string[];
  recommendedIntervalKm?: number;
  isPopular?: boolean;
}

// ==================== Booking Schemas ====================

export const bookingStatusEnum = z.enum([
  'DRAFT',
  'SEARCHING',
  'ASSIGNED',
  'ON_THE_WAY',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);
export type BookingStatus = z.infer<typeof bookingStatusEnum>;

export const createBookingSchema = z.object({
  serviceId: z.string().uuid().or(z.string().min(1)),
  vehicleId: z.string().uuid().or(z.string().min(1)),
  scheduledAt: z.string().datetime(),
  address: z.string().min(5, 'Address is required'),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  serviceName: string;
  servicePricePaise: number;
  vehicleId: string;
  vehicleSummary: string;
  mechanicId?: string;
  mechanicName?: string;
  mechanicPhone?: string;
  mechanicAvatar?: string;
  status: BookingStatus;
  scheduledAt: string;
  address: string;
  latitude: number;
  longitude: number;
  totalAmountPaise: number;
  paidAmountPaise: number;
  balanceAmountPaise: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Mechanic Schemas ====================

export const mechanicTypeEnum = z.enum(['SHOP', 'INDIVIDUAL', 'DIRECT_JOB']);
export type MechanicType = z.infer<typeof mechanicTypeEnum>;

export const mechanicKycStatusEnum = z.enum(['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED']);
export type MechanicKycStatus = z.infer<typeof mechanicKycStatusEnum>;

export const mechanicOnboardingProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  shopName: z.string().optional(),
  experienceYears: z.number().int().min(0).max(60),
  alternatePhone: phoneSchema.optional(),
});
export type MechanicOnboardingProfileInput = z.infer<typeof mechanicOnboardingProfileSchema>;

export const mechanicSkillsSchema = z.object({
  vehicleTypes: z.array(vehicleTypeEnum).min(1, 'Select at least one vehicle type'),
  serviceCategoryIds: z.array(z.string()).min(1, 'Select at least one skill'),
});
export type MechanicSkillsInput = z.infer<typeof mechanicSkillsSchema>;

export const mechanicLocationSchema = z.object({
  address: z.string().min(5, 'Address required'),
  latitude: z.number(),
  longitude: z.number(),
  radiusKm: z.number().min(1).max(50),
});
export type MechanicLocationInput = z.infer<typeof mechanicLocationSchema>;

export const mechanicBankSchema = z.object({
  accountHolderName: z.string().min(2),
  accountNumber: z.string().min(8).max(20),
  ifscCode: z.string().length(11),
  upiId: z.string().optional(),
});
export type MechanicBankInput = z.infer<typeof mechanicBankSchema>;

export interface MechanicJobOffer {
  id: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  address: string;
  distanceKm: number;
  payoutPaise: number;
  expiresAt: string;
}

// ==================== Subscription Schemas ====================

export interface SubscriptionPlan {
  id: string;
  title: string;
  tagline: string;
  pricePaise: number;
  validityDays: number;
  benefits: string[];
  badge?: string;
}
