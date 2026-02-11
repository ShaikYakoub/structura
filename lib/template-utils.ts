/**
 * Template utility functions
 * These are client-side helpers that don't require server action treatment
 */

/**
 * Get template preview URL
 * @param subdomain - The subdomain of the template
 * @returns The full preview URL
 */
export function getTemplatePreviewUrl(subdomain: string): string {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000";
  return `https://${subdomain}.${appDomain}`;
}
