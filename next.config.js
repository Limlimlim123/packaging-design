/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['limboxbox.vercel.app']  // 修改这里
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  env: {
    NEXT_PUBLIC_APP_URL: 'https://limboxbox.vercel.app',
    NEXT_PUBLIC_API_URL: 'https://limboxbox.vercel.app/api',
    NEXT_PUBLIC_SOCKET_URL: 'https://limboxbox.vercel.app'
  }
}

module.exports = nextConfig