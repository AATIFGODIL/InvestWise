
/** @type {import('next').NextConfig} */
const nextConfig = {
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
    experimental: {
        allowedDevOrigins: ["https://*.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev"],
    },
};

export default nextConfig;
