'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Download, ArrowRight } from 'lucide-react'
import { PreviewPanel } from './previews/PreviewPanel'

// 设计类型定义
export interface DesignType {
  id: string
  name: string
  type: string
  category: string
  style: string
  thumbnail: string
  images: {
    flat: string
    threeD: string
    dieline: string
  }
  dimensions?: {
    width: number
    height: number
    depth: number
  }
  sizes: string[]
  price: number
}

interface DesignDetailProps {
  design: DesignType
  onClose: () => void
}

export function DesignDetail({ design, onClose }: DesignDetailProps) {
  const [selectedSize, setSelectedSize] = useState(design.sizes[0])

  // 键盘快捷键处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  // 如果没有提供尺寸，使用默认值
  const dimensions = design.dimensions || {
    width: 2,
    height: 1.5,
    depth: 1
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{design.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-auto flex flex-col md:flex-row">
          {/* 左侧预览区 */}
          <div className="md:w-2/3 p-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
              <PreviewPanel 
                design={{
                  images: design.images,
                  dimensions: dimensions
                }} 
              />
            </div>
          </div>

          {/* 右侧信息区 */}
          <div className="md:w-1/3 border-t md:border-t-0 md:border-l">
            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">包装类型</h3>
                  <p className="mt-1 text-gray-900">{design.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">产品类别</h3>
                  <p className="mt-1 text-gray-900">{design.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">设计风格</h3>
                  <p className="mt-1 text-gray-900">{design.style}</p>
                </div>
              </div>

              {/* 尺寸选择 */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">选择尺寸</h3>
                <div className="flex flex-wrap gap-2">
                  {design.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* 价格信息 */}
              <div className="pt-4 border-t">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-500">起步价</span>
                  <span className="text-2xl font-semibold text-gray-900">
                    ¥{design.price.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  最终价格根据具体定制要求计算
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                <Link
                  href={`/custom?template=${design.id}&size=${selectedSize}`}
                  className="flex items-center justify-center w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors group"
                >
                  开始定制
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  className="flex items-center justify-center w-full py-3 px-4 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => window.open(design.images.dieline, '_blank')}
                >
                  下载刀版图
                  <Download className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}