/** @type {import('next').NextConfig} */

const withExportImages = require('next-export-optimize-images');

const nextConfig = withExportImages({
  reactStrictMode: true,
});

module.exports = nextConfig;
