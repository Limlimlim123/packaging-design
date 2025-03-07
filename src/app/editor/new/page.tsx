'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">包装设计编辑器</h1>
        
        {/* 编辑器主体内容 */}
        <div className="grid grid-cols-12 gap-4">
          {/* 工具栏 */}
          <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
            工具栏
          </div>
          
          {/* 画布区域 */}
          <div className="col-span-8 bg-gray-100 p-4 rounded-lg min-h-[600px]">
            画布区域
          </div>
          
          {/* 属性面板 */}
          <div className="col-span-2 bg-gray-100 p-4 rounded-lg">
            属性面板
          </div>
        </div>
      </div>
    </div>
  )
}