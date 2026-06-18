const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for development
  // Add it back only when building for production: next build && next export
  images: {
    unoptimized: true,
  },
}

module.exports = withNextIntl(nextConfig)
