/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This is required to allow the Next.js dev server to accept requests from the
    // Firebase Studio preview URL.
    allowedDevOrigins: [
      "https://*.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
