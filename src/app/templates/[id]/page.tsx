'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Edit, Share2, Download } from 'lucide-react'

// 定义模板类型
interface Template {
  id: string
  name: string
  description?: string
  category: string
  preview2D?: string
  preview3D?: string
  dieline?: string
  sizes: {
    width: number
    height: number
  }
  price: number
}

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchTemplate() {
      if (!params.id) return

      try {
        const response = await fetch(`/api/templates/${params.id}`)
        if (!response.ok) {
          throw new Error('模板加载失败')
        }
        const data = await response.json()
        setTemplate(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] w-full bg-gray-200 animate-pulse rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
            <div className="h-24 w-full bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => router.push('/templates')}
          >
            返回模板列表
          </button>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">模板不存在</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => router.push('/templates')}
          >
            返回模板列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 返回按钮 */}
      <button
        className="mb-8 flex items-center text-gray-600 hover:text-gray-900"
        onClick={() => router.push('/templates')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回模板列表
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 预览区域 */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border">
            {template.preview2D && (
              <Image
                src={template.preview2D}
                alt={template.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center justify-center"
              onClick={() => {
                // 实现分享功能
                alert('分享功能开发中')
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </button>
            <button
              className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center justify-center"
              onClick={() => {
                // 实现下载功能
                alert('下载功能开发中')
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              下载预览图
            </button>
          </div>
        </div>

        {/* 详情区域 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{template.name}</h1>
            <p className="text-gray-500">
              {template.sizes.width} x {template.sizes.height} cm
            </p>
          </div>

          {template.description && (
            <div>
              <h2 className="font-semibold mb-2">模板描述</h2>
              <p className="text-gray-600">{template.description}</p>
            </div>
          )}

          <div>
            <h2 className="font-semibold mb-2">适用场景</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {template.category}
              </span>
            </div>
          </div>

          {/* 价格信息 */}
          <div>
            <h2 className="font-semibold mb-2">价格</h2>
            <p className="text-xl font-bold text-blue-600">
              ¥{template.price}
            </p>
          </div>

          {/* 使用按钮 */}
          <button 
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            onClick={() => router.push(`/editor/new?template=${template.id}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            使用此模板
          </button>
        </div>
      </div>
    </div>
  )
}