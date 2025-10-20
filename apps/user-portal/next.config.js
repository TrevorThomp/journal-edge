/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@journal-edge/types',
    '@journal-edge/utils',
    '@journal-edge/config',
    '@journal-edge/db',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Enable experimental features for optimal performance
  experimental: {
    optimizePackageImports: ['@reduxjs/toolkit', 'react-hook-form'],
  },
};

module.exports = nextConfig;
