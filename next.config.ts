import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Try stable config first
  serverActions: {
    bodySizeLimit: "10mb",
  },
  // Try experimental config as fallback for older Next 14/15 versions
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
