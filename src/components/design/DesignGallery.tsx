'use client'

import { useState } from 'react'
import { DesignFilter } from './DesignFilter'
import { DesignGrid } from './DesignGrid'
import { DesignDetail } from './DesignDetail'
import { Pagination } from '../design-gallery/Pagination'

export type DesignType = {
  id: string
  name: string
  type: '盒型' | '袋型'
  category: string
  style: string
  thumbnail: string
  images: {
    flat: string    // 平面效果图
    threeD: string  // 3D效果图
    dieline: string // 刀版图
  }
  sizes: string[]
  price: number
}

export function DesignGallery() {
  const [selectedDesign, setSelectedDesign] = useState<DesignType | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    style: '',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1) // 这个值应该从API获取

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 这里应该触发新的数据加载
  }

  return (
    <div className="space-y-6">
      <DesignFilter 
        filters={filters}
        onChange={setFilters}
      />
      
      {selectedDesign ? (
        <DesignDetail
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
        />
      ) : (
        <>
          <DesignGrid
            filters={filters}
            page={currentPage}
            onSelect={setSelectedDesign}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}