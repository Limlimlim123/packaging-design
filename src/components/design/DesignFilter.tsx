'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

const TYPES = [
    { value: 'box', label: '盒型' },
    { value: 'bag', label: '袋型' }
]

const CATEGORIES = [
    { value: 'food', label: '食品' },
    { value: 'clothing', label: '服装' },
    { value: 'electronics', label: '电子产品' },
    { value: 'cosmetics', label: '化妆品' },
    { value: 'gifts', label: '礼品' }
]

const STYLES = [
    { value: 'minimal', label: '简约' },
    { value: 'luxury', label: '奢华' },
    { value: 'cute', label: '可爱' },
    { value: 'vintage', label: '复古' },
    { value: 'modern', label: '现代' }
]

export function DesignFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeFilters, setActiveFilters] = useState({
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
        style: searchParams.get('style') || ''
    })

    // 更新筛选条件
    const updateFilter = (key: string, value: string) => {
        const newFilters = { ...activeFilters, [key]: value }
        setActiveFilters(newFilters)

        // 更新URL参数
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/designs?${params.toString()}`)
    }

    // 清除所有筛选
    const clearFilters = () => {
        setActiveFilters({ type: '', category: '', style: '' })
        router.push('/designs')
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-wrap gap-4">
                {/* 包装类型 */}
                <Select
                    value={activeFilters.type}
                    onValueChange={value => updateFilter('type', value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="包装类型" />
                    </SelectTrigger>
                    <SelectContent>
                        {TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 产品类别 */}
                <Select
                    value={activeFilters.category}
                    onValueChange={value => updateFilter('category', value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="产品类别" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                                {category.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 设计风格 */}
                <Select
                    value={activeFilters.style}
                    onValueChange={value => updateFilter('style', value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="设计风格" />
                    </SelectTrigger>
                    <SelectContent>
                        {STYLES.map(style => (
                            <SelectItem key={style.value} value={style.value}>
                                {style.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 清除按钮 */}
                {(activeFilters.type || activeFilters.category || activeFilters.style) && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-gray-500"
                    >
                        清除筛选
                    </Button>
                )}
            </div>

            {/* 活动筛选标签 */}
            {(activeFilters.type || activeFilters.category || activeFilters.style) && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {activeFilters.type && (
                        <Badge variant="secondary" className="px-3 py-1">
                            {TYPES.find(t => t.value === activeFilters.type)?.label}
                            <button
                                onClick={() => updateFilter('type', '')}
                                className="ml-2"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {activeFilters.category && (
                        <Badge variant="secondary" className="px-3 py-1">
                            {CATEGORIES.find(c => c.value === activeFilters.category)?.label}
                            <button
                                onClick={() => updateFilter('category', '')}
                                className="ml-2"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {activeFilters.style && (
                        <Badge variant="secondary" className="px-3 py-1">
                            {STYLES.find(s => s.value === activeFilters.style)?.label}
                            <button
                                onClick={() => updateFilter('style', '')}
                                className="ml-2"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}
        </div>
    )
}