/** @type {import('next').NextConfig} */
// SneakerDeal v1.0 — deployed on Vercel
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
