/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Enables static site export
    images: {
      unoptimized: true, // Fixes issues with Next.js image optimization
    },
  };
  
  module.exports = nextConfig;
  