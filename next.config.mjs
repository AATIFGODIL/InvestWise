// InvestWise - A modern stock trading and investment education platform for young investors

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {},
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'img.logokit.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.brandfetch.io',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
        ],
    },
};

export default nextConfig;
