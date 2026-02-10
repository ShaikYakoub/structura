import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  generatePresignedUrl,
  generateUniqueFilename,
  getPublicUrl,
  isS3Configured,
} from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if S3 is configured
    if (!isS3Configured()) {
      return NextResponse.json(
        { 
          error: "Image uploads not configured. Please add DigitalOcean Spaces credentials to your .env file.",
          details: "Missing: DO_SPACES_KEY, DO_SPACES_SECRET, DO_SPACES_ENDPOINT, DO_SPACES_BUCKET"
        },
        { status: 503 }
      );
    }

    const { filename, contentType } = await request.json();

    // Validate content type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 },
      );
    }

    // Generate unique key
    const key = `uploads/${generateUniqueFilename(filename)}`;

    // Generate presigned URL
    const presignedUrl = await generatePresignedUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}
