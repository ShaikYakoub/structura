import crypto from "crypto";

/**
 * Generates a SHA256 hash of JSON content for reliable comparison
 * Normalizes object by sorting keys to avoid false positives
 */
export function generateContentHash(content: any): string {
  if (!content) return "";

  // Normalize JSON by sorting keys recursively
  const normalized = JSON.stringify(content, Object.keys(content).sort());

  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Checks if draft content differs from published content using hash comparison
 */
export function hasContentChanged(
  draftContent: any,
  publishedContent: any
): boolean {
  const draftHash = generateContentHash(draftContent);
  const publishedHash = generateContentHash(publishedContent);

  return draftHash !== publishedHash;
}
