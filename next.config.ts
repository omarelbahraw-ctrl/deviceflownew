import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Try experimental config as fallback for older Next 14/15 versions
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
