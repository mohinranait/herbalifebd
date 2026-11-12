/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@prisma/orm-mongo',
    'mongodb-connection-string-url',
  ],
  images: {
    remotePatterns: [
      { hostname: 'images.app.goo.gl' },
      { hostname: 'res.cloudinary.com' },
      { hostname: 'cdn.prod.website-files.com' },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },
};

export default nextConfig;
