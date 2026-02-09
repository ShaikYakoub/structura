import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  // Enable strict mode for better error detection
  reactStrictMode: true,
  
  // Disable powered by header for security
  poweredByHeader: false,
};

export default nextConfig;
