export interface UploadParams {
  buffer: Buffer;
  key: string;
  mimeType: string;
}

export interface StorageProvider {
  upload(params: UploadParams): Promise<string>;
}
