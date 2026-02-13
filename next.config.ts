import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Enable strict mode for better error detection
  reactStrictMode: true,

  // Disable powered by header for security
  poweredByHeader: false,

  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com",
      },
    ],
  },

  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
