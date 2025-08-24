/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow requests from Firebase Studio development environments
  allowedDevOrigins: [
    "https://*.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev",
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
};

export default nextConfig;
