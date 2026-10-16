import * as crypto from 'crypto';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes confusing characters (0, O, 1, I)

/**
 * Generates a human-friendly booking code in the format: GZ-XXXXXX
 * (6 random alphanumeric characters from unambiguous uppercase set)
 */
export function generateBookingCode(): string {
  const length = 6;
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      result += CHARSET[byte % CHARSET.length];
    }
  }
  return `GZ-${result}`;
}
