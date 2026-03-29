/** @type {import('next').NextConfig} */
// SneakerDeal v1.0 — deployed on Vercel
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "static.nike.com" },
      { protocol: "https", hostname: "assets.adidas.com" },
      { protocol: "https", hostname: "img01.ztat.net" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "images.footlocker.com" },
      { protocol: "https", hostname: "i8.amplience.net" },
      { protocol: "https", hostname: "**.snipes.com" },
      { protocol: "https", hostname: "**.bstn.com" },
      { protocol: "https", hostname: "**.asphaltgold.com" },
    ],
  },
};

export default nextConfig;
