/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    // This is required for the app to be able to run in IDX which is a cloud-based IDE.
    // This allows all origins to access the dev server.
    allowedDevOrigins: ['*'],
  },
};

export default nextConfig;
