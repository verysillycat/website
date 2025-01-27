import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            // For Discord RPC we need to allow all domains
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;
