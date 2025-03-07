'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Design {
  id: string
  name: string
  description: string | null
  thumbnail: string | null
  status: string
  createdAt: string
}

export default function MyDesignsPage() {
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // 检查认证状态
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        setIsAuthenticated(response.ok)
      } catch (error) {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const fetchDesigns = async () => {
        try {
          const response = await fetch('/api/designs')
          if (response.ok) {
            const data = await response.json()
            setDesigns(data)
          }
        } catch (error) {
          console.error('获取设计列表失败:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchDesigns()
    }
  }, [isAuthenticated])

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">请先登录</h2>
          <p className="mt-2 text-gray-600">登录后即可查看您的设计作品</p>
          <Link
            href="/login"
            className="mt-4 inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            去登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">我的设计</h1>
          <Link
            href="/designs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            新建设计
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-8 text-center text-gray-600">加载中...</div>
        ) : designs.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map(design => (
              <div 
                key={design.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-lg mb-2">{design.name}</h3>
                <p className="text-sm text-gray-600">{design.description}</p>
                <div className="mt-4 text-sm text-gray-500">
                  创建于 {new Date(design.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 text-center text-gray-600">
            <p>还没有任何设计</p>
            <p className="mt-2">点击"新建设计"开始创建您的第一个设计</p>
          </div>
        )}
      </div>
    </div>
  )
}