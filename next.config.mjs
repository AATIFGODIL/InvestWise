/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // This block is crucial for ensuring the production Firebase config is available client-side.
  // It reads the server-side environment variable provided by Firebase App Hosting
  // and exposes it as a public, client-accessible variable.
  env: {
    NEXT_PUBLIC_FIREBASE_CONFIG: process.env.FIREBASE_WEBAPP_CONFIG,
  },
};

export default nextConfig;
