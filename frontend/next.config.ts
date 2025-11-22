import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static export for Azure Static Web Apps
  trailingSlash: true, // Ensures compatibility with static hosting
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
