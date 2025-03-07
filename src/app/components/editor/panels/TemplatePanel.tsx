'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
    LayoutTemplate,
    Search,
    Filter,
    Star,
    Clock,
    Heart,
    Download
} from 'lucide-react'

interface Template {
    id: string
    name: string
    category: string
    thumbnail: string
    data: string
    tags: string[]
    likes: number
    downloads: number
    isLiked?: boolean
    isFavorite?: boolean
}

const categories = ['全部', '包装', '标签', '海报', '名片', '其他']

export function TemplatePanel() {
    const { canvas, addHistoryEntry } = useEditorStore()
    const { toast } = useToast()
    const [templates, setTemplates] = useState<Template[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('全部')
    const [loading, setLoading] = useState(false)
    const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'downloads'>('popular')

    // 模拟从API获取模板
    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true)
            try {
                // 这里应该是实际的API调用
                const response = await fetch('/api/templates')
                const data = await response.json()
                setTemplates(data)
            } catch (error) {
                console.error('Failed to fetch templates:', error)
                toast({
                    title: "加载失败",
                    description: "无法加载模板，请稍后重试",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }

        fetchTemplates()
    }, [])

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesCategory = selectedCategory === '全部' || template.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        switch (sortBy) {
            case 'popular':
                return b.likes - a.likes
            case 'newest':
                return new Date(b.id).getTime() - new Date(a.id).getTime()
            case 'downloads':
                return b.downloads - a.downloads
            default:
                return 0
        }
    })

    const applyTemplate = useCallback(async (template: Template) => {
        if (!canvas) return

        try {
            canvas.loadFromJSON(template.data, () => {
                canvas.renderAll()
                addHistoryEntry()
                toast({
                    title: "应用成功",
                    description: `已应用模板"${template.name}"`
                })
            })

            // 更新下载次数
            // await fetch(`/api/templates/${template.id}/download`, { method: 'POST' })
        } catch (error) {
            console.error('Failed to apply template:', error)
            toast({
                title: "应用失败",
                description: "无法应用模板，请重试",
                variant: "destructive"
            })
        }
    }, [canvas])

    const toggleLike = useCallback(async (template: Template) => {
        try {
            // await fetch(`/api/templates/${template.id}/like`, { method: 'POST' })
            setTemplates(prev => prev.map(t => 
                t.id === template.id 
                    ? { ...t, isLiked: !t.isLiked, likes: t.isLiked ? t.likes - 1 : t.likes + 1 }
                    : t
            ))
        } catch (error) {
            console.error('Failed to toggle like:', error)
        }
    }, [])

    const toggleFavorite = useCallback(async (template: Template) => {
        try {
            // await fetch(`/api/templates/${template.id}/favorite`, { method: 'POST' })
            setTemplates(prev => prev.map(t => 
                t.id === template.id 
                    ? { ...t, isFavorite: !t.isFavorite }
                    : t
            ))
        } catch (error) {
            console.error('Failed to toggle favorite:', error)
        }
    }, [])

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    模板库
                </h3>
            </div>

            <div className="flex space-x-2">
                <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索模板..."
                        className="pl-9"
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="全部">
                <TabsList className="w-full">
                    {categories.map(category => (
                        <TabsTrigger
                            key={category}
                            value={category}
                            onClick={() => setSelectedCategory(category)}
                            className="flex-1"
                        >
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="flex items-center justify-between my-4">
                    <div className="flex space-x-2">
                        <Button
                            variant={sortBy === 'popular' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSortBy('popular')}
                        >
                            <Star className="h-4 w-4 mr-2" />
                            热门
                        </Button>
                        <Button
                            variant={sortBy === 'newest' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSortBy('newest')}
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            最新
                        </Button>
                        <Button
                            variant={sortBy === 'downloads' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setSortBy('downloads')}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            下载量
                        </Button>
                    </div>
                </div>

                <ScrollArea className="h-[500px]">
                    <div className="grid grid-cols-2 gap-4">
                        {loading ? (
                            <div className="col-span-2 text-center py-8">
                                加载中...
                            </div>
                        ) : sortedTemplates.length === 0 ? (
                            <div className="col-span-2 text-center py-8">
                                没有找到匹配的模板
                            </div>
                        ) : (
                            sortedTemplates.map(template => (
                                <div
                                    key={template.id}
                                    className="relative group"
                                >
                                    <img
                                        src={template.thumbnail}
                                        alt={template.name}
                                        className="w-full aspect-video object-cover rounded-lg cursor-pointer"
                                        onClick={() => applyTemplate(template)}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleLike(template)}
                                            className={template.isLiked ? 'text-red-500' : 'text-white'}
                                        >
                                            <Heart className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleFavorite(template)}
                                            className={template.isFavorite ? 'text-yellow-500' : 'text-white'}
                                        >
                                            <Star className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-sm font-medium">
                                            {template.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {template.downloads} 下载 · {template.likes} 喜欢
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </Tabs>
        </div>
    )
}