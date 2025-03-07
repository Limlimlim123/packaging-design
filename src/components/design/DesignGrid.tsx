'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Template {
    id: string
    name: string
    thumbnail: string
    type: string
    category: string
    style: string[]
    price: number
}

interface DesignGridProps {
    initialTemplates?: Template[]
}

export function DesignGrid({ initialTemplates = [] }: DesignGridProps) {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)
    
    const { ref, inView } = useInView()

    useEffect(() => {
        const loadMore = async () => {
            if (!inView || loading || !hasMore) return

            setLoading(true)
            try {
                const response = await fetch(`/api/templates?page=${page}`)
                const data = await response.json()
                
                if (data.templates.length === 0) {
                    setHasMore(false)
                    return
                }

                setTemplates(prev => [...prev, ...data.templates])
                setPage(prev => prev + 1)
            } catch (error) {
                console.error('加载模板失败:', error)
            } finally {
                setLoading(false)
            }
        }

        loadMore()
    }, [inView, loading, hasMore, page])

    if (templates.length === 0 && !loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">暂无符合条件的设计模板</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map(template => (
                    <Link
                        key={template.id}
                        href={`/designs/${template.id}`}
                        className="group"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                            <Image
                                src={template.thumbnail}
                                alt={template.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                                {template.name}
                            </h3>
                            <div className="mt-1 flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                    {template.type === 'box' ? '盒型' : '袋型'}
                                </span>
                                <span className="text-gray-300">·</span>
                                <span className="text-sm text-gray-500">
                                    起价 {formatPrice(template.price)}
                                </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {template.style.map(style => (
                                    <span
                                        key={style}
                                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                                    >
                                        {style}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 加载更多 */}
            {hasMore && (
                <div
                    ref={ref}
                    className="flex justify-center py-8"
                >
                    {loading && (
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    )}
                </div>
            )}
        </div>
    )
}