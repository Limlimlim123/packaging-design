'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FilterBar } from '@/components/design-gallery/FilterBar'
import { PackageType, ProductCategory, DesignStyle } from '@/types/design'
import { Skeleton } from '@/components/ui/skeleton'
import { useDesignStore } from '@/store/designStore'

export default function DesignPage() {
  const router = useRouter()
  const { designs, loading, error, fetchDesigns } = useDesignStore()
  const [filters, setFilters] = useState({
    type: '' as PackageType | '',
    category: '' as ProductCategory | '',
    style: '' as DesignStyle | '',
    searchQuery: ''
  })

  // 首次加载数据
  useEffect(() => {
    fetchDesigns()
  }, [])

  // 处理筛选变化
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    fetchDesigns(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">包装设计模板</h1>
          <p className="text-gray-600 mt-2">选择合适的设计模板开始定制</p>
        </div>

        {/* 筛选栏 */}
        <div className="mb-8">
          <FilterBar 
            filters={filters}
            onChange={handleFilterChange}
          />
        </div>

        {/* 设计网格 */}
        {loading ? (
          // 加载状态
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : error ? (
          // 错误状态
          <div className="text-center py-12">
            <p className="text-red-500">加载失败，请稍后重试</p>
          </div>
        ) : designs.length === 0 ? (
          // 空状态
          <div className="text-center py-12">
            <p className="text-gray-500">没有找到匹配的设计模板</p>
          </div>
        ) : (
          // 设计列表
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {designs.map(design => (
              <div 
                key={design.id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() => router.push(`/design/editor/${design.id}`)}
              >
                {/* 预览图 */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={design.thumbnailUrl}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                {/* 信息区 */}
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">
                    {design.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {design.description}
                  </p>
                  
                  {/* 标签 */}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {design.type === 'box' ? '盒型' : '袋型'}
                    </span>
                    {design.tags?.map(tag => (
                      <span 
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-100 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}