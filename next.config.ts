// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Activá o ajustá lo que necesites acá
  reactStrictMode: true,

  images: {
    // Permitimos cargar imágenes externas desde eBay
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ebayimg.com",
      },
      {
        protocol: "https",
        hostname: "img.ebayimg.com",
      },
    ],
  },
};

export default nextConfig;
