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
  webpack: (config, { isServer }) => {
    // This is to fix a bug with genkit and handlebars
    if (isServer) {
      config.externals.push('handlebars');
    }
    return config;
  },
};

export default nextConfig;
