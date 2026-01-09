/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle pdfjs-dist canvas dependency
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    return config;
  },
};

export default nextConfig;
