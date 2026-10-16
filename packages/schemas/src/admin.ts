import { z } from 'zod';
import { phoneSchema, otpSchema, passwordSchema, emailSchema } from './auth';
import { uuidParam } from './common';

export const adminLoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Identifier is required').refine(
    (val) => {
      // Check if valid email OR valid phone
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      const isPhone = /^(\+91|91)?[6-9]\d{9}$/.test(val);
      return isEmail || isPhone;
    },
    { message: 'Identifier must be a valid email or Indian mobile number' }
  ),
  password: z.string().min(1, 'Password is required'),
});

export const challengeOtpSchema = z.object({
  challengeId: uuidParam,
  otp: otpSchema,
});

export const challengeTotpSchema = z.object({
  challengeId: uuidParam,
  code: z.string().length(6).regex(/^\d{6}$/, 'TOTP code must be 6 digits'),
});

export const inviteAcceptSchema = z.object({
  inviteToken: z.string().min(1, 'Invite token is required'),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const adminRoleEnum = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'OPERATIONS',
  'SUPPORT',
  'FINANCE',
]);

export const inviteAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  phone: phoneSchema,
  email: emailSchema,
  role: z.enum(['ADMIN', 'OPERATIONS', 'SUPPORT', 'FINANCE']),
  jurisdictionId: uuidParam,
});

export const kycDocStatusEnum = z.enum(['APPROVED', 'REJECTED']);

export const kycDocumentReviewSchema = z.object({
  docId: uuidParam,
  status: kycDocStatusEnum,
  rejectionReason: z.string().max(300).optional(),
});

export const kycReviewSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REJECT']),
    documents: z.array(kycDocumentReviewSchema).min(1, 'At least one document review must be provided'),
  })
  .refine(
    (data) => {
      if (data.decision === 'REJECT') {
        return data.documents.some((doc) => doc.status === 'REJECTED' && Boolean(doc.rejectionReason));
      }
      return true;
    },
    {
      message: 'When rejecting KYC, rejected documents must include a rejection reason',
      path: ['documents'],
    }
  );

export const refundSchema = z.object({
  bookingId: uuidParam,
  amountPaise: z.number().int().positive('Refund amount must be positive in paise'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
});

export const disputeResolveSchema = z.object({
  resolution: z.string().min(5, 'Resolution summary is required').max(1000),
  refundPaise: z.number().int().nonnegative().optional(),
  mechanicPenaltyPaise: z.number().int().nonnegative().optional(),
  note: z.string().max(500).optional(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type ChallengeOtpInput = z.infer<typeof challengeOtpSchema>;
export type ChallengeTotpInput = z.infer<typeof challengeTotpSchema>;
export type InviteAcceptInput = z.infer<typeof inviteAcceptSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type InviteAdminInput = z.infer<typeof inviteAdminSchema>;
export type KycReviewInput = z.infer<typeof kycReviewSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
export type DisputeResolveInput = z.infer<typeof disputeResolveSchema>;
