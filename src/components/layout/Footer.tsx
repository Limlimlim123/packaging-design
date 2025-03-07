'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react'

const footerLinks = {
  关于我们: [
    { name: '公司介绍', href: '/about' },
    { name: '联系我们', href: '/contact' },
    { name: '加入我们', href: '/careers' },
    { name: '新闻动态', href: '/news' },
  ],
  帮助中心: [
    { name: '常见问题', href: '/faq' },
    { name: '设计指南', href: '/guide' },
    { name: '尺寸说明', href: '/sizes' },
    { name: '印刷工艺', href: '/printing' },
  ],
  服务支持: [
    { name: '文件要求', href: '/requirements' },
    { name: '价格说明', href: '/pricing' },
    { name: '配送说明', href: '/shipping' },
    { name: '售后服务', href: '/service' },
  ],
  商务合作: [
    { name: '企业定制', href: '/enterprise' },
    { name: '批量订制', href: '/bulk-order' },
    { name: '代理加盟', href: '/partnership' },
    { name: '设计师入驻', href: '/designers' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'Youtube', icon: Youtube, href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 公司信息 */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-white">PackageDesign</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400 max-w-md">
              专业的包装设计定制平台，为您提供高品质的包装设计解决方案。无论是个性化定制还是批量生产，我们都能满足您的需求。
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5" />
                <span>400-123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5" />
                <span>support@packagedesign.com</span>
              </div>
            </div>
          </div>

          {/* 链接分组 */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 社交媒体和版权信息 */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* 社交媒体链接 */}
            <div className="flex space-x-6">
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{link.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                )
              })}
            </div>

            {/* 版权信息 */}
            <div className="text-sm text-gray-400">
              <p>© 2024 PackageDesign. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 备案信息 */}
      <div className="bg-gray-950">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition-colors"
          >
            粤ICP备XXXXXXXX号-1
          </a>
        </div>
      </div>
    </footer>
  )
}