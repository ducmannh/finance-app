import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  allowedDevOrigins: [
    "localhost",
    "localhost:2304",
    "127.0.0.1",
    "127.0.0.1:2304",
    "192.168.1.223",
    "192.168.1.223:2304",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:2304",
        "127.0.0.1:2304",
        "192.168.1.223:2304",
        "192.168.1.223",
      ],
    },
  },
};

export default nextConfig;
