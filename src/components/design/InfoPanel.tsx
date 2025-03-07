'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DesignType } from './DesignDetail'

interface InfoPanelProps {
  design: DesignType
  onSizeChange: (size: string) => void
  selectedSize: string
}

export function InfoPanel({ design, onSizeChange, selectedSize }: InfoPanelProps) {
  const [activeTab, setActiveTab] = useState('info')

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">基本信息</TabsTrigger>
          <TabsTrigger value="specs">规格参数</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="flex-1 p-4">
          <div className="space-y-6">
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
          </div>
        </TabsContent>

        <TabsContent value="specs" className="flex-1 p-4">
          <div className="space-y-6">
            {/* 尺寸规格 */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">可选尺寸</h3>
              <div className="flex flex-wrap gap-2">
                {design.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => onSizeChange(size)}
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

            {/* 尺寸详情 */}
            {design.dimensions && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">当前尺寸详情</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">长</div>
                    <div className="mt-1 font-medium">{design.dimensions.width}cm</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">宽</div>
                    <div className="mt-1 font-medium">{design.dimensions.height}cm</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">高</div>
                    <div className="mt-1 font-medium">{design.dimensions.depth}cm</div>
                  </div>
                </div>
              </div>
            )}

            {/* 材质信息 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">推荐材质</h3>
              <p className="text-sm text-gray-600">
                白卡纸 250g/m² - 350g/m²
              </p>
              <p className="text-xs text-gray-500">
                具体材质可根据实际需求调整
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}