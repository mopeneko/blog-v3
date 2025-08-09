import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mope-blog.assets.newt.so',
      },
    ],
  },
};

export default nextConfig;
