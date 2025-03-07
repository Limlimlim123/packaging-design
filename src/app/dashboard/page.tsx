'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Design {
  id: string
  name: string
  description: string | null
  thumbnail: string | null
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('获取到的 token:', token)

        if (!token) {
          console.log('未找到 token，重定向到登录页')
          router.push('/login')
          return
        }

        console.log('开始获取设计列表')
        const response = await fetch('/api/designs', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        })

        console.log('API 响应状态:', response.status)

        if (response.status === 401) {
          console.log('token 已过期或无效，重定向到登录页')
          localStorage.removeItem('token')
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error(`获取设计列表失败: ${response.status}`)
        }

        const data = await response.json()
        console.log('获取到的设计列表:', data)
        setDesigns(data.designs || [])
        
      } catch (err) {
        console.error('获取设计列表失败:', err)
        setError(err instanceof Error ? err.message : '获取设计列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchDesigns()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">包装设计平台</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  router.push('/login')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">我的设计</h2>
            <button
              onClick={() => router.push('/templates')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              新建设计
            </button>
          </div>

          {designs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">还没有设计作品，立即创建一个吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map(design => (
                <div
                  key={design.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-4">
                    {design.thumbnail && (
                      <img
                        src={design.thumbnail}
                        alt={design.name}
                        className="w-full h-48 object-cover rounded"
                      />
                    )}
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {design.name}
                      </h3>
                      {design.description && (
                        <p className="mt-1 text-gray-500">{design.description}</p>
                      )}
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {new Date(design.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {design.status === 'draft' ? '草稿' : '已完成'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}