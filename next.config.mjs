/** @type {import('next').NextConfig} */
/* eslint-disable */
const nextConfig = {
  // Compression gzip / brotli activée
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Optimisation SWC : supprime les console.log inutiles en production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  images: {
    // Formats modernes haute compression (AVIF ~50% plus léger que JPEG, WebP ~30%)
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours de cache pour les images optimisées
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // Cache headers immuables pour les assets statiques et images
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
export default nextConfig;