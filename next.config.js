/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    CURRENT_YEAR: new Date().getFullYear(),
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
