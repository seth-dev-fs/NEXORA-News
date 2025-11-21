/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any image from picsum.photos
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      }
    ],
  },
};

module.exports = nextConfig;