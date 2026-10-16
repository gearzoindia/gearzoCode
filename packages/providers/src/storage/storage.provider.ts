export interface StorageProvider {
  getUploadUrl(
    key: string,
    contentType: string,
    expiresInSec?: number,
  ): Promise<{ url: string; key: string }>;
  getDownloadUrl(key: string, expiresInSec?: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
