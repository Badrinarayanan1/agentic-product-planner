import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL?.startsWith('http')
          ? `${process.env.BACKEND_URL}/api/:path*`
          : `http://${process.env.BACKEND_URL || 'localhost:8000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
