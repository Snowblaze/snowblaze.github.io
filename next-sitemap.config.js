/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://snowblaze.github.io',
  generateRobotsTxt: true,
  // ...other options
};

export default config;
