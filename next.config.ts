import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/XpvJpm7N.js',
        destination: 'https://cloud.umami.is/script.js',
      },
    ];
  },
};

export default nextConfig;
