// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Activá o ajustá lo que necesites acá
  reactStrictMode: true,

  images: {
    // Permitimos cargar imágenes externas desde eBay y el generador de placeholders
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ebayimg.com",
      },
      {
        protocol: "https",
        hostname: "img.ebayimg.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co", // 🛠️ Sumado para evitar el error de Runtime
      },
    ],
  },
};

export default nextConfig;