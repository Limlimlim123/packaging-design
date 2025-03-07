'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Template {
  id: string
  name: string
  description: string | null
  thumbnail: string | null
  category: string
  price: number
  featured: boolean
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true)
        const response = await fetch('/templates')
        if (!response.ok) {
          throw new Error('获取模板失败')
        }
        const data = await response.json()
        console.log('Templates data:', data)
        if (data.status === 'success') {
          setTemplates(data.data.templates)
        } else {
          throw new Error(data.message || '获取模板失败')
        }
      } catch (err) {
        console.error('Error fetching templates:', err)
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">包装模板</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div 
            key={template.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {template.thumbnail && (
              <div className="relative h-48">
                <Image
                  src={template.thumbnail}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{template.name}</h2>
                {template.featured && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    推荐
                  </span>
                )}
              </div>
              {template.description && (
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{template.category}</span>
                <span className="text-blue-600 font-medium">¥{template.price}</span>
              </div>
              <button
                onClick={() => router.push(`/templates/${template.id}`)}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                查看详情
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}