import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "media.canva.com",
      },
      {
        protocol: "https",
        hostname: "yfzqurdmbllthonjdzpb.supabase.co",
      },
    ],
  },
};

export default nextConfig;
