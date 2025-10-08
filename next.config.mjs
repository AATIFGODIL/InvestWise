
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
            },
            {
                protocol: 'https',
                hostname: 'static2.finnhub.io',
            },
            {
                protocol: 'https',
                hostname: 'image.cnbcfm.com',
            },
            {
                protocol: 'https',
                hostname: 'data.bloomberglp.com',
            }
        ],
    },
};

export default nextConfig;
