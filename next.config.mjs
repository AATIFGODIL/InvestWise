/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Other experimental features can go here
  },
  // allowedDevOrigins should be at the top level, not inside experimental
  allowedDevOrigins: [
    "https://*.cloudworkstations.dev",
  ],
};

export default nextConfig;
