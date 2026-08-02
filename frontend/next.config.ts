import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de produto vêm do backend Django (MEDIA_URL). Em produção,
    // trocar pelo domínio real da API (ou do bucket S3/R2) quando existir.
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "localhost", port: "8000" },
    ],
  },
};

export default nextConfig;
