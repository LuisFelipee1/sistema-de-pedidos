import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    // Fotos de produto vêm do backend Django (MEDIA_URL). Em produção,
    // trocar pelo domínio real da API (ou do bucket S3/R2) quando existir.
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "localhost", port: "8000" },
    ],
    // O Next 16 passou a recusar otimizar imagens de IP privado (proteção
    // contra SSRF), e em dev o Django serve o media justamente em 127.0.0.1.
    // Liberado só em desenvolvimento: em produção o media sai de um domínio
    // público, então a proteção continua valendo onde ela importa.
    dangerouslyAllowLocalIP: isDev,
  },
};

export default nextConfig;
