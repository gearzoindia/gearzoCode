/**
 * Normalizes an Indian mobile number to E.164 (+91XXXXXXXXXX) format.
 * Throws an Error if the phone number is invalid.
 */
export function formatE164(phone: string): string {
  if (!phone) {
    throw new Error('Phone number is required');
  }

  const cleaned = phone.trim();
  const digits = cleaned.replace(/\D/g, '');

  // Must end with 10 digits starting with 6-9
  const last10 = digits.slice(-10);
  if (last10.length !== 10 || !/^[6-9]\d{9}$/.test(last10)) {
    throw new Error(`Invalid Indian mobile number: ${phone}`);
  }

  return `+91${last10}`;
}

/**
 * Masks a mobile number for display: +91 98XXXXX123
 */
export function maskPhone(phone: string): string {
  const normalized = formatE164(phone);
  // normalized is +91XXXXXXXXXX (13 chars total)
  const last10 = normalized.slice(3); // 10 digits
  const first2 = last10.slice(0, 2);
  const last3 = last10.slice(-3);
  return `+91 ${first2}XXXXX${last3}`;
}

/**
 * Returns the last 4 digits of a phone number.
 */
export function last4Phone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) {
    throw new Error('Phone number must contain at least 4 digits');
  }
  return digits.slice(-4);
}
