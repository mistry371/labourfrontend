import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 'standalone' is for Docker/Railway; Netlify plugin handles its own output
  output: process.env.NETLIFY ? undefined : 'standalone',
  images: {
    domains: ['localhost', process.env.CLOUDFRONT_DOMAIN || ''],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
    NEXT_PUBLIC_RAZORPAY_KEY: process.env.NEXT_PUBLIC_RAZORPAY_KEY || '',
  },
};

export default nextConfig;
