import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { StorageProvider } from './storage.provider';

@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  private readonly logger = new Logger(CloudinaryStorageProvider.name);
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
    this.apiKey = process.env.CLOUDINARY_API_KEY || '';
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || '';

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      this.logger.warn(
        'Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully configured',
      );
    }

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });
  }

  async getUploadUrl(
    key: string,
    contentType: string,
    _expiresInSec: number = 3600,
  ): Promise<{ url: string; key: string }> {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign: Record<string, string | number> = {
      public_id: key,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, this.apiSecret);
    const resourceType = contentType.startsWith('image/')
      ? 'image'
      : contentType.startsWith('video/')
        ? 'video'
        : 'auto';

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload?api_key=${this.apiKey}&timestamp=${timestamp}&public_id=${encodeURIComponent(key)}&signature=${signature}`;

    return { url, key };
  }

  async getDownloadUrl(key: string, expiresInSec: number = 3600): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSec;
    const signedUrl = cloudinary.url(key, {
      secure: true,
      sign_url: true,
      expires_at: expiresAt,
    });
    return signedUrl;
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const result: { result: string } = await cloudinary.uploader.destroy(key, { invalidate: true });
      if (result.result !== 'ok' && result.result !== 'not found') {
        this.logger.warn(`Cloudinary destroy returned status: ${result.result} for key: ${key}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete file from Cloudinary (key: ${key}): ${message}`);
      throw error;
    }
  }
}
