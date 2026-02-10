/**
 * Convert YouTube/Vimeo URLs to embed URLs
 */
export function convertToEmbedUrl(url: string): string | null {
  // YouTube patterns
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);

  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);

  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Already an embed URL
  if (
    url.includes("youtube.com/embed/") ||
    url.includes("player.vimeo.com/video/")
  ) {
    return url;
  }

  return null;
}

/**
 * Get video platform from URL
 */
export function getVideoPlatform(url: string): "youtube" | "vimeo" | "unknown" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube";
  }
  if (url.includes("vimeo.com")) {
    return "vimeo";
  }
  return "unknown";
}
