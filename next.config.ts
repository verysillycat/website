import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: 'github.com',
            },
            {
                hostname: 'cdn.discordapp.com',
            },
            {
                hostname: 'i.scdn.co',
            },
            {
                hostname: 'raw.githubusercontent.com',
            },
            {
                hostname: 'dcdn.dstn.to',
            },
        ],
    },
};

export default nextConfig;
