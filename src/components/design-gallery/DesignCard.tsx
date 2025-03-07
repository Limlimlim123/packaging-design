'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, Package, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DesignItem } from '@/types/design'
import { formatPrice } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface DesignCardProps {
  design: DesignItem
  onClick: (design: DesignItem) => void
  onQuickView?: (design: DesignItem) => void
}

export function DesignCard({ design, onClick, onQuickView }: DesignCardProps) {
  const [imageLoading, setImageLoading] = useState(true)

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation()
    onQuickView?.(design)
  }

  return (
    <div 
      className="group cursor-pointer bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300"
      onClick={() => onClick(design)}
    >
      {/* 图片容器 */}
      <div className="relative aspect-square">
        {imageLoading && (
          <div className="absolute inset-0">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        <Image
          src={design.thumbnailUrl}
          alt={design.name}
          fill
          className={cn(
            "object-cover transition-all duration-300",
            imageLoading ? "opacity-0" : "opacity-100 group-hover:scale-105"
          )}
          onLoadingComplete={() => setImageLoading(false)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        
        {/* 快速预览按钮 */}
        {onQuickView && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={handleQuickView}
              className="bg-white text-gray-900 px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              <span>快速预览</span>
            </button>
          </div>
        )}
      </div>

      {/* 信息区域 */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-gray-900 truncate">{design.name}</h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-1" />
            <span>{design.type === 'box' ? '盒型' : '袋型'}</span>
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            <span>{formatPrice(design.price.base, design.price.unit)}</span>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
            {design.category}
          </span>
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
            {design.style}
          </span>
          {design.tags?.map((tag) => (
            <span 
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}