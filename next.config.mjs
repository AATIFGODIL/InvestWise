/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This setting resolves the "Cross origin request detected" warning
    // by explicitly allowing requests from the development environment's domain.
    allowedDevOrigins: ["*.cloudworkstations.dev"],
  },
};

export default nextConfig;
