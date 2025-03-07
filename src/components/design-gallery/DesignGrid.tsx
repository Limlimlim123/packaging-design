'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { DesignCard } from './DesignCard'
import { useDesignStore } from '@/store/designStore'
import { Loader2 } from 'lucide-react'

export function DesignGrid() {
  const { designs, loading, error, fetchDesigns, fetchMoreDesigns } = useDesignStore()
  
  // 无限滚动
  const { ref, inView } = useInView()
  
  useEffect(() => {
    if (inView && !loading) {
      fetchMoreDesigns()
    }
  }, [inView])

  // 首次加载
  useEffect(() => {
    fetchDesigns()
  }, [])

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">加载失败: {error.message}</p>
      </div>
    )
  }

  if (!loading && designs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">没有找到匹配的设计</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {designs.map((design) => (
          <DesignCard
            key={design.id}
            design={design}
          />
        ))}
      </div>

      {/* 加载更多指示器 */}
      <div ref={ref} className="flex justify-center py-8">
        {loading && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>
    </div>
  )
}