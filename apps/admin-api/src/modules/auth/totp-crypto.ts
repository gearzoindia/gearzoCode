import * as crypto from 'crypto';

export class TotpCrypto {
  private static getKey(): Buffer {
    const rawKey =
      process.env.TOTP_ENC_KEY ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    // If hex string of 64 chars, parse as 32-byte buffer
    if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
      return Buffer.from(rawKey, 'hex');
    }
    // Otherwise hash to 32 bytes using SHA-256
    return crypto.createHash('sha256').update(rawKey).digest();
  }

  static encrypt(plaintext: string): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  static decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Malformed encrypted secret format');
    }

    const [ivHex, tagHex, encryptedHex] = parts;
    const key = this.getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
