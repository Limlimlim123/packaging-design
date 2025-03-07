'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { Package, Ruler, Palette } from 'lucide-react'

interface Size {
    name: string
    width: number
    height: number
    depth: number
    price: number
}

interface DesignInfoProps {
    template: {
        id: string
        name: string
        description: string
        type: string
        category: string
        style: string[]
        sizes: Size[]
        price: number
    }
}

export function DesignInfo({ template }: DesignInfoProps) {
    const router = useRouter()
    const [selectedSize, setSelectedSize] = useState<string>(template.sizes[0]?.name || '')

    // 获取选中尺寸的价格
    const getSelectedPrice = () => {
        const size = template.sizes.find(s => s.name === selectedSize)
        return size ? size.price : template.price
    }

    // 开始定制
    const handleCustomize = () => {
        const size = template.sizes.find(s => s.name === selectedSize)
        if (!size) return

        router.push(`/editor/new?template=${template.id}&size=${selectedSize}`)
    }

    return (
        <div className="space-y-6">
            {/* 基本信息 */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {template.name}
                </h1>
                <p className="mt-2 text-gray-500">
                    {template.description}
                </p>
            </div>

            <Separator />

            {/* 产品属性 */}
            <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">包装类型：</span>
                    <span className="font-medium">
                        {template.type === 'box' ? '盒型' : '袋型'}
                    </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                    <Ruler className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">产品类别：</span>
                    <span className="font-medium">
                        {template.category}
                    </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">设计风格：</span>
                    <div className="flex flex-wrap gap-2">
                        {template.style.map(style => (
                            <Badge
                                key={style}
                                variant="secondary"
                            >
                                {style}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <Separator />

            {/* 尺寸选择 */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                    选择尺寸
                </label>
                <Select
                    value={selectedSize}
                    onValueChange={setSelectedSize}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="选择包装尺寸" />
                    </SelectTrigger>
                    <SelectContent>
                        {template.sizes.map(size => (
                            <SelectItem
                                key={size.name}
                                value={size.name}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span>{size.name}</span>
                                    <span className="text-gray-500">
                                        {size.width}×{size.height}×{size.depth}mm
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* 价格显示 */}
                <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-500">起订量：1000个</span>
                    <div>
                        <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(getSelectedPrice())}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                            /千个
                        </span>
                    </div>
                </div>
            </div>

            {/* 操作按钮 */}
            <div className="pt-4">
                <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCustomize}
                >
                    开始定制
                </Button>
            </div>
        </div>
    )
}