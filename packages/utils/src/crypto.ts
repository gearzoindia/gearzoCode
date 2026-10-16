import * as crypto from 'crypto';

/**
 * Generates a cryptographically secure numeric OTP of the specified length (default: 6).
 */
export function generateOtp(length = 6): string {
  if (length <= 0 || length > 10) {
    throw new Error('OTP length must be between 1 and 10');
  }
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const num = crypto.randomInt(min, max + 1);
  return num.toString();
}

/**
 * Computes a SHA-256 hash of the input string and returns hexadecimal output.
 */
export function hashSha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generates a cryptographically secure 256-bit random token (32 bytes = 64 hex characters).
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes an OTP along with its requestId and a secret pepper.
 * This ensures that even identical OTPs have different hashes across requests.
 */
export function hashOtp(otp: string, requestId: string, pepper: string): string {
  return hashSha256(`${requestId}:${otp}:${pepper}`);
}
