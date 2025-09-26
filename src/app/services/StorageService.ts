import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {UploadParams} from "../interfaces/StorageInterface";

// Usa as variáveis de ambiente do usuário e define 'us-east-1' como padrão para a região
const region = process.env.S3_REGION || 'us-east-1';
const bucketName = process.env.S3_BUCKET_NAME;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const endpoint = process.env.S3_ENDPOINT; // ex: http://localhost:9000

if (!bucketName || !accessKeyId || !secretAccessKey) {
  console.warn("S3 environment variables are not fully configured. StorageService may not work as expected.");
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  },
  ...(endpoint && {endpoint, forcePathStyle: true}),
});

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

    await s3Client.send(command);

    return key;
  }
};
