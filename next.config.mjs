/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required for genkit to work.
    config.externals.push('node:stream/web');
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is to allow requests from the firebase studio preview URL.
    allowedDevOrigins: [
      '*.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
