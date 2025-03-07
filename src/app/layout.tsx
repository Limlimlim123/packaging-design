import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastContainer } from "@/components/ui/Toast"
import { Toaster } from "sonner"

// 配置 Inter 字体
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: '包装设计平台',
  description: '在线包装设计与定制平台',
  keywords: '包装设计,在线设计,包装定制,包装印刷',
  authors: [{ name: '包装设计平台' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  robots: 'index, follow',
  themeColor: '#ffffff',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <TooltipProvider>
          {children}
          <ToastContainer />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  )
}