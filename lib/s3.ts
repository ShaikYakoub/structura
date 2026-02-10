import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Validate environment variables
function validateEnv() {
  const required = [
    "DO_SPACES_KEY",
    "DO_SPACES_SECRET",
    "DO_SPACES_ENDPOINT",
    "DO_SPACES_BUCKET",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

validateEnv();

// Initialize S3 client for DigitalOcean Spaces
export const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: "us-east-1", // DigitalOcean Spaces uses a fixed region
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

export const BUCKET_NAME = process.env.DO_SPACES_BUCKET!;

// Generate public URL for uploaded file
export function getPublicUrl(key: string): string {
  const endpoint = process.env.DO_SPACES_ENDPOINT!.replace("https://", "");
  return `https://${BUCKET_NAME}.${endpoint}/${key}`;
}

// Generate unique filename
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const extension = originalName.split(".").pop();
  return `${timestamp}-${random}.${extension}`;
}

// Generate presigned URL for upload
export async function generatePresignedUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  return getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
}
