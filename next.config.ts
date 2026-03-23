import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set the output file tracing root to silence the multiple lockfiles warning
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Hide Next.js dev indicator button in the corner
  devIndicators: false,
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
