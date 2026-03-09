import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
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
      { protocol: "https", hostname: "pisces.bbystatic.com" },
      { protocol: "https", hostname: "shokz.com" },
      { protocol: "https", hostname: "assets.adidas.com" },
      { protocol: "https", hostname: "dms.deckers.com" },
      { protocol: "https", hostname: "images.ctfassets.net" },
      { protocol: "https", hostname: "s7d4.scene7.com" },
      { protocol: "https", hostname: "maurten.imgix.net" },
      { protocol: "https", hostname: "www.sockgeek.com" },
      { protocol: "https", hostname: "spibelt.com" },
      { protocol: "https", hostname: "epictv.com" },
      { protocol: "https", hostname: "www.rei.com" },
      { protocol: "https", hostname: "salomonstore.com.ar" },
      { protocol: "https", hostname: "satisfyrunning.com" },
      { protocol: "https", hostname: "www.stryd.com" },
      { protocol: "https", hostname: "www.adidas.com", pathname: "/**" },
      { protocol: "https", hostname: "www.fjallrvane.sbs", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "www.fjallraven.com", pathname: "/490ebc/**" },
      { protocol: "https", hostname: "www.fjallraven.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;