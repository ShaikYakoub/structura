/**
 * Generate Google Maps Embed URL from address
 * Note: For production, use Google Maps Embed API with API key
 */
export function generateMapEmbedUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
}

/**
 * Check if URL is already a Google Maps embed URL
 */
export function isGoogleMapsEmbedUrl(url: string): boolean {
  return url.includes('google.com/maps/embed') || url.includes('output=embed');
}
