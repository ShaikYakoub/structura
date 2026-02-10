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

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `DigitalOcean Spaces not configured. Missing environment variables: ${missing.join(", ")}. ` +
      `Please add them to your .env file to enable image uploads.`
    );
  }
}

// Check if S3 is configured (don't throw, just return boolean)
export function isS3Configured(): boolean {
  return !!(
    process.env.DO_SPACES_KEY &&
    process.env.DO_SPACES_SECRET &&
    process.env.DO_SPACES_ENDPOINT &&
    process.env.DO_SPACES_BUCKET
  );
}

// Initialize S3 client lazily
let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  validateEnv();
  
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: "us-east-1", // DigitalOcean Spaces uses a fixed region
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!,
      },
    });
  }
  
  return s3ClientInstance;
}

function getBucketName(): string {
  validateEnv();
  return process.env.DO_SPACES_BUCKET!;
}

// Generate public URL for uploaded file
export function getPublicUrl(key: string): string {
  validateEnv();
  const endpoint = process.env.DO_SPACES_ENDPOINT!.replace("https://", "");
  const bucketName = getBucketName();
  return `https://${bucketName}.${endpoint}/${key}`;
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
  contentlient = getS3Client();
  const bucketName = getBucketName();
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  return getSignedUrl(c

  return getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes
}
