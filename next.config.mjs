
// @ts-check

// This file is not intended to be ran directly.
// It is used by the Next.js framework to configure the build.
// For more information, see: https://nextjs.org/docs/api-reference/next.config.js/introduction

import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.logokit.com',
      }
    ],
  },
  // This is the crucial part for App Hosting to expose backend secrets
  experimental: {
    instrumentationHook: true,
  },
  // Expose the FIREBASE_CONFIG environment variable to the client-side
  // This is needed for the Firebase SDK to initialize in the browser
  env: {
    NEXT_PUBLIC_FIREBASE_CONFIG: process.env.FIREBASE_WEBAPP_CONFIG,
  },
};

export default nextConfig;
