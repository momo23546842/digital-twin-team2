import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  headers: async () => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    
    // In production, log warning if ALLOWED_ORIGIN not explicitly set
    if (process.env.NODE_ENV === 'production' && !allowedOrigin) {
      console.warn('⚠️  ALLOWED_ORIGIN environment variable not set. CORS will default to localhost.');
      console.warn('   Set ALLOWED_ORIGIN in Vercel environment variables for production use.');
    }
    
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: allowedOrigin || "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
          {
            key: "Vary",
            value: "Origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
