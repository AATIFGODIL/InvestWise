/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep this empty if no other experimental features are needed.
    // allowedDevOrigins has been moved to the top level.
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
  // This is a top-level configuration, not inside 'experimental'.
  allowedDevOrigins: ["*.cloudworkstations.dev", "*.apptivi.dev"],
};

export default nextConfig;
