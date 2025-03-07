import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function DesignsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="font-bold text-xl">
              包装设计
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/designs" className="text-sm font-medium hover:text-blue-600">
                设计模板
              </Link>
              <Link href="/my-designs" className="text-sm font-medium hover:text-blue-600">
                我的设计
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/profile">个人中心</Link>
            </Button>
            <Button asChild>
              <Link href="/designs">开始设计</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 底部版权信息 */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          © 2024 包装设计平台. 保留所有权利.
        </div>
      </footer>
    </div>
  )
}