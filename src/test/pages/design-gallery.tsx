'use client'

import { DesignCard } from '@/components/design-gallery/DesignCard'
import { DesignGrid } from '@/components/design-gallery/DesignGrid'

const mockDesign = {
  id: '1',
  name: '测试设计',
  type: 'box',
  category: 'food',
  style: 'minimal',
  thumbnailUrl: '/test.jpg',
  // ... 其他属性
}

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">设计图库组件测试</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">设计卡片测试</h2>
        <DesignCard
          design={mockDesign}
          onClick={() => {}}
          onQuickView={() => {}}
        />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">设计列表测试</h2>
        <DesignGrid
          filters={{}}
          page={1}
          onSelect={() => {}}
        />
      </section>
    </div>
  )
}