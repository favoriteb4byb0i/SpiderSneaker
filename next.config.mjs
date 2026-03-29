/** @type {import('next').NextConfig} */
// SneakerDeal — deployed on Vercel
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
