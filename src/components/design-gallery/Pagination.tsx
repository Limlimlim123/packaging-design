'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal 
} from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

const PAGE_SIZE_OPTIONS = [
  { label: '12 条/页', value: '12' },
  { label: '24 条/页', value: '24' },
  { label: '36 条/页', value: '36' },
  { label: '48 条/页', value: '48' }
]

export function Pagination({ 
  currentPage, 
  totalPages, 
  pageSize,
  total,
  onPageChange, 
  onPageSizeChange 
}: PaginationProps) {
  const [jumpPage, setJumpPage] = useState('')

  // 生成页码数组
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    const halfVisible = Math.floor(maxVisiblePages / 2)

    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大可见页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 计算显示范围
      let startPage = Math.max(1, currentPage - halfVisible)
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      // 调整起始页
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      // 添加第一页
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) pages.push(-1) // 添加省略号
      }

      // 添加中间页码
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // 添加最后一页
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push(-1) // 添加省略号
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handleJumpPage = () => {
    const page = parseInt(jumpPage)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
      setJumpPage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpPage()
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* 分页信息 */}
      <div className="text-sm text-gray-500">
        共 {total} 条，每页 
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
          className="inline-block w-20 mx-2"
        >
          {PAGE_SIZE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        条
      </div>

      <div className="flex items-center gap-2">
        {/* 页码导航 */}
        <div className="flex items-center gap-1">
          {/* 首页 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* 上一页 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* 页码按钮 */}
          {getPageNumbers().map((pageNum, index) => (
            pageNum === -1 ? (
              <Button
                key={`ellipsis-${index}`}
                variant="ghost"
                size="icon"
                disabled
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => onPageChange(pageNum)}
                className="hidden sm:inline-flex"
              >
                {pageNum}
              </Button>
            )
          ))}

          {/* 下一页 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* 末页 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 跳转页码 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">前往</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-16 text-center"
            />
            <span className="text-sm text-gray-500">页</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleJumpPage}
            disabled={!jumpPage || parseInt(jumpPage) < 1 || parseInt(jumpPage) > totalPages}
          >
            跳转
          </Button>
        </div>
      </div>
    </div>
  )
}