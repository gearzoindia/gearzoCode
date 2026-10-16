import { z } from 'zod';
import { phoneSchema, otpSchema, deviceSchema, emailSchema } from './auth';
import { uuidParam } from './common';

export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

export const verifyOtpSchema = z.object({
  requestId: uuidParam,
  phone: phoneSchema,
  otp: otpSchema,
  device: deviceSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const customerProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s.]+$/, 'Name can only contain letters, spaces, and dots'),
  email: emailSchema.optional(),
  cityId: uuidParam,
});

export const vehicleTypeEnum = z.enum(['TWO_WHEELER', 'FOUR_WHEELER', 'COMMERCIAL']);
export const fuelTypeEnum = z.enum(['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID']);

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  type: vehicleTypeEnum,
  brandId: uuidParam,
  modelId: uuidParam.optional(),
  customModel: z.string().max(100).optional(),
  fuelType: fuelTypeEnum,
  regNumber: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/, 'Invalid vehicle registration number format (e.g. MH12AB1234)')
    .optional(),
  year: z
    .number()
    .int()
    .min(1990, 'Year must be 1990 or later')
    .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}`)
    .optional(),
  nickname: z.string().max(50, 'Nickname cannot exceed 50 characters').optional(),
});

export const addressLabelEnum = z.enum(['HOME', 'WORK', 'OTHER']);

export const addressSchema = z.object({
  label: addressLabelEnum,
  line1: z.string().min(1, 'Address line 1 is required').max(200),
  line2: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const serviceModeEnum = z.enum(['DOORSTEP', 'PICKUP_DROP', 'DRIVE_IN']);
export const scheduleTypeEnum = z.enum(['INSTANT', 'SCHEDULE']);

export const bookingQuoteSchema = z.object({
  vehicleId: uuidParam,
  serviceIds: z.array(uuidParam).min(1, 'At least one service must be selected'),
  serviceMode: serviceModeEnum,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  schedule: z.object({
    type: scheduleTypeEnum,
    scheduledAt: z.string().datetime({ message: 'scheduledAt must be an ISO-8601 UTC string' }).optional(),
  }),
  couponCode: z.string().trim().max(30).optional(),
});

export const bookingForEnum = z.enum(['MYSELF', 'SOMEONE_ELSE']);
export const paymentMethodEnum = z.enum(['ONLINE', 'CASH', 'UPI_DIRECT', 'WALLET']);

export const recipientSchema = z.object({
  name: z.string().min(2).max(50),
  phone: phoneSchema,
  relationship: z.string().max(50).optional(),
});

export const createBookingSchema = z
  .object({
    quoteId: uuidParam,
    bookingFor: bookingForEnum,
    recipient: recipientSchema.optional(),
    serviceMode: serviceModeEnum,
    scheduleType: scheduleTypeEnum,
    addressId: uuidParam.optional(),
    address: addressSchema.optional(),
    paymentMethod: paymentMethodEnum,
    couponCode: z.string().trim().max(30).optional(),
    termsVersion: z.string().optional(),
    instructions: z.string().max(500, 'Instructions cannot exceed 500 characters').optional(),
    idempotencyKey: uuidParam,
  })
  .refine(
    (data) => Boolean(data.addressId || data.address),
    {
      message: 'Either addressId or address must be provided',
      path: ['addressId'],
    }
  )
  .refine(
    (data) => (data.bookingFor === 'SOMEONE_ELSE' ? Boolean(data.recipient) : true),
    {
      message: 'Recipient details are required when booking for someone else',
      path: ['recipient'],
    }
  );

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  tags: z.array(z.string().min(1)).default([]),
  comment: z.string().max(500, 'Comment cannot exceed 500 characters').optional(),
});

export const bookingListQuerySchema = z.object({
  status: z.enum(['all', 'ongoing', 'completed', 'cancelled']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type BookingQuoteInput = z.infer<typeof bookingQuoteSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;
