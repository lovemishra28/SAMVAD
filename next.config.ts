import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // destination: "http://localhost:5000/api/:path*",
        destination: "https://samvad-backend-p18q.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
