/** @type {import('next').NextConfig} */
const nextConfig = {
  // `allowedDevOrigins` must be a top-level property.
  experimental: {
    // This property is intentionally left empty as allowedDevOrigins is not experimental.
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

export default nextConfig;
