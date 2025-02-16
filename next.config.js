/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Avoids issues with Next.js image optimization on static hosting
  },
};

module.exports = nextConfig;
