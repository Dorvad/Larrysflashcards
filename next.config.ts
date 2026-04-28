import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable PWA-friendly features
  reactStrictMode: true,
  // Support Hebrew (RTL) and English (LTR) in the same app
  i18n: undefined,
  experimental: {
    // Improve server component performance
    serverComponentsExternalPackages: ["@supabase/ssr"],
  },
};

export default nextConfig;
