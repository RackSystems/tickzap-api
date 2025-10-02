import {S3Client, PutObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {UploadParams} from "../interfaces/StorageInterface";
import {MediaType, MessageType, TicketStatus} from "@prisma/client";
import HttpException from "../exceptions/HttpException";


// Common S3 configuration
const region = process.env.S3_REGION || 'us-east-1';
const bucketName = process.env.S3_BUCKET_NAME;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const internalEndpoint = process.env.S3_ENDPOINT; // For internal Docker communication
const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT; // For external browser access

if (!bucketName || !accessKeyId || !secretAccessKey) {
  console.warn("S3 environment variables are not fully configured. StorageService may not work as expected.");
}

// Client for internal operations like upload, using the Docker-internal hostname
const s3InternalClient = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
  ...(internalEndpoint && {endpoint: internalEndpoint, forcePathStyle: true}),
});

// Client for generating publicly accessible signed URLs, using the public hostname
const s3PublicClient = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
  // Use public endpoint if available, otherwise fall back to internal
  ...(publicEndpoint ? {endpoint: publicEndpoint, forcePathStyle: true} : (internalEndpoint && {endpoint: internalEndpoint, forcePathStyle: true})),
});

const messageTypeToMediaTypeMap: Record<string, MediaType> = {
  imageMessage: 'IMAGE',
  videoMessage: 'VIDEO',
  audioMessage: 'AUDIO',
  documentMessage: 'DOCUMENT',
  stickerMessage: 'IMAGE',
};

/**
 * Interface para upload de mídia genérico
 */
interface UploadMediaParams {
  base64Data: string;
  fileName: string;
  mimeType: string;
  ticketId: string;
}

/**
 * Interface para o resultado do upload
 */
interface UploadMediaResult {
  mediaUrl: string;
  mediaType: MediaType | null;
}

export default {
  async upload({buffer, key, mimeType}: UploadParams): Promise<string> {
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME environment variable is not configured.");
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read',
    });

    // Use the internal client for the upload operation
    await s3InternalClient.send(command);

    return key;
  },

  async getSignedUrl(key: string): Promise<string> {
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME environment variable is not configured.");
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // Use the public client to generate a URL accessible from the browser
    // The URL will be valid for 1 hour
    return getSignedUrl(s3PublicClient, command, {expiresIn: 3600});
  },

  /**
   * Função genérica para fazer upload de mídia para o Minio
   * Não depende de Message.convertMedia
   */
  async uploadMediaToStorage(params: UploadMediaParams): Promise<UploadMediaResult> {
    const { base64Data, fileName, mimeType, ticketId } = params;

    if (!base64Data || typeof base64Data !== 'string') {
      throw new HttpException('Dados base64 inválidos ou não fornecidos.', 415);
    }

    // Converte base64 para Buffer
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Define a chave do arquivo no storage
    const fileKey = `tickets/${ticketId}/${fileName}`;

    // Faz upload para o storage
    const mediaUrl = await this.upload({
      buffer: fileBuffer,
      key: fileKey,
      mimeType: mimeType,
    });

    // Determina o tipo de mídia baseado no mimetype
    let mediaType: MediaType | null = null;
    if (mimeType.startsWith('image/')) {
      mediaType = MediaType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      mediaType = MediaType.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      mediaType = MediaType.AUDIO;
    } else if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) {
      mediaType = MediaType.DOCUMENT;
    }

    return { mediaUrl, mediaType };
  }

};