/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['limboxbox.vercel.app']
  },
  experimental: {
    serverExternalPackages: ['@prisma/client']  // 修改这里
  }
}

module.exports = nextConfig