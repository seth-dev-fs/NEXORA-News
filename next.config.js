/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.gizmodo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static01.nyt.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.macrumors.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vox-cdn.com',
        port: '',
        pathname: '/**',
      },
      // Wildcard domains
      {
        protocol: 'https',
        hostname: '*.theverge.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.techcrunch.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.wired.com',
        port: '',
        pathname: '/**',
      },
      // Common domains found during scraping
      {
        protocol: 'https',
        hostname: 'cdn.mos.cms.futurecdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sammobile.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.androidauthority.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gsmarena.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.notebookcheck.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'feeds.weblogssl.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '9to5linux.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'itsfoss.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.omgubuntu.co.uk',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'arstechnica.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
  experimental: {
    allowFutureImageOptimization: true, // If applicable to your Next.js version
  },
};

module.exports = nextConfig;