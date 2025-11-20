/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  
  // Production optimizations
  swcMinify: true,
  compress: isProduction,
  
  // Image optimization
  images: {
    formats: isProduction ? ['image/avif', 'image/webp'] : undefined,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      ...(isProduction ? [{
        protocol: 'https',
        hostname: '**',
      }] : []),
    ],
  },
  
  // Remove console.log in production
  compiler: {
    removeConsole: isProduction ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Security headers
  async headers() {
    if (!isProduction) return [];
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;


