import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      // ✅ Ya tenías
      { protocol: "https", hostname: "us.pandora.net", pathname: "/dw/image/**" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "static.nike.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "i.ebayimg.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "www.filson.com" },
      { protocol: "https", hostname: "www.lego.com", pathname: "/cdn/**" },
      { protocol: "https", hostname: "assets.thenorthface.com" },
      { protocol: "https", hostname: "www.thenorthface.com" },
      { protocol: "https", hostname: "pisces.bbystatic.com" }, // BestBuy (Garmin)
      { protocol: "https", hostname: "shokz.com" }, // Shokz
      { protocol: "https", hostname: "assets.adidas.com" }, // adidas
      { protocol: "https", hostname: "dms.deckers.com" }, // HOKA (Deckers)
      { protocol: "https", hostname: "images.ctfassets.net" }, // On Running (CTF assets)
      { protocol: "https", hostname: "s7d4.scene7.com" }, // Saucony (Scene7)
      { protocol: "https", hostname: "maurten.imgix.net" }, // Maurten (Imgix)
      { protocol: "https", hostname: "www.sockgeek.com" }, // Balega retailer
      { protocol: "https", hostname: "spibelt.com" }, // SPIbelt
      { protocol: "https", hostname: "epictv.com" }, // Petzl retailer
      { protocol: "https", hostname: "www.rei.com" }, // REI
      { protocol: "https", hostname: "salomonstore.com.ar" }, // Salomon AR (imágenes)
      { protocol: "https", hostname: "satisfyrunning.com" }, // HydraPak retailer (Shopify)
      { protocol: "https", hostname: "www.stryd.com" }, // Stryd (_next/image)
      { protocol: "https", hostname: "www.adidas.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;