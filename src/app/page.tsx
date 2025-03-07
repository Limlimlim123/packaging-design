'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              在线包装设计平台
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              简单易用的包装设计工具，让您的创意快速变为现实
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="px-8">
                <Link href="/designs">开始设计</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/my-designs">我的设计</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/profile" className="flex items-center">
                  个人中心
                  <span aria-hidden="true" className="ml-2">→</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}