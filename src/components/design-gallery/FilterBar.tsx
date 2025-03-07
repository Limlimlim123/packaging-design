'use client'

import { useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PackageType, ProductCategory, DesignStyle } from '@/types/design'
import { debounce } from 'lodash'

interface FilterBarProps {
  filters: {
    type: PackageType | ''
    category: ProductCategory | ''
    style: DesignStyle | ''
    searchQuery: string
  }
  onChange: (filters: FilterBarProps['filters']) => void
}

const PACKAGE_TYPES = [
  { label: '全部', value: '' },
  { label: '盒型', value: 'box' },
  { label: '袋型', value: 'bag' }
]

const PRODUCT_CATEGORIES = [
  { label: '全部', value: '' },
  { label: '食品', value: 'food' },
  { label: '服装', value: 'clothing' },
  { label: '电子', value: 'electronics' },
  { label: '化妆品', value: 'cosmetics' },
  { label: '其他', value: 'other' }
]

const DESIGN_STYLES = [
  { label: '全部', value: '' },
  { label: '简约', value: 'minimal' },
  { label: '奢华', value: 'luxury' },
  { label: '可爱', value: 'cute' },
  { label: '现代', value: 'modern' },
  { label: '传统', value: 'traditional' }
]

export function FilterBar({ filters, onChange }: FilterBarProps) {
  // 防抖处理搜索
  const handleSearch = useCallback(
    debounce((value: string) => {
      onChange({ ...filters, searchQuery: value })
    }, 300),
    [filters, onChange]
  )

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索设计..."
              className="pl-10"
              defaultValue={filters.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 筛选选项 */}
        <div className="flex flex-wrap sm:flex-nowrap gap-4">
          <Select
            value={filters.type}
            onValueChange={(value) => 
              onChange({ ...filters, type: value as PackageType })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="包装类型" />
            </SelectTrigger>
            <SelectContent>
              {PACKAGE_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) => 
              onChange({ ...filters, category: value as ProductCategory })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="产品类别" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.style}
            onValueChange={(value) => 
              onChange({ ...filters, style: value as DesignStyle })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="设计风格" />
            </SelectTrigger>
            <SelectContent>
              {DESIGN_STYLES.map(style => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}