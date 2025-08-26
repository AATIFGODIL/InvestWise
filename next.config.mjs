/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  devServer: {
    allowedHosts: ["*.cloudworkstations.dev"],
  },
};
export default nextConfig;
