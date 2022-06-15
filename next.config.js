/** @type {import('next').NextConfig} */

const withExportImages = require('next-export-optimize-images');

const nextConfig = withExportImages({
  env: {
    CURRENT_YEAR: new Date().getFullYear(),
  },
  reactStrictMode: true,
});

module.exports = nextConfig;
