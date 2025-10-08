/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'static2.finnhub.io',
            },
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
                hostname: 'image.cnbcfm.com',
            }
        ],
    },
};

export default nextConfig;
