'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Search, Layout, Star, StarOff, Plus } from 'lucide-react'

interface Template {
    id: string
    name: string
    description: string
    thumbnail: string
    category: string
    tags: string[]
    favorite: boolean
}

interface TemplateGalleryProps {
    onSelectTemplate: (templateId: string) => Promise<void>
    onCreateBlank: () => void
}

export function TemplateGallery({ onSelectTemplate, onCreateBlank }: TemplateGalleryProps) {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<string>('all')
    const [favorites, setFavorites] = useState<Set<string>>(new Set())
    const { toast } = useToast()

    // 加载模板
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const response = await fetch('/api/templates')
                const data = await response.json()
                
                if (!response.ok) {
                    throw new Error(data.error)
                }

                setTemplates(data)
                // 加载收藏状态
                const favs = localStorage.getItem('favoriteTemplates')
                if (favs) {
                    setFavorites(new Set(JSON.parse(favs)))
                }
            } catch (error) {
                toast({
                    title: '错误',
                    description: '加载模板失败',
                    variant: 'destructive'
                })
            } finally {
                setLoading(false)
            }
        }

        loadTemplates()
    }, [toast])

    // 过滤模板
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
            template.description.toLowerCase().includes(search.toLowerCase()) ||
            template.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
        
        const matchesCategory = category === 'all' || 
            category === 'favorites' ? favorites.has(template.id) : template.category === category

        return matchesSearch && matchesCategory
    })

    // 切换收藏
    const toggleFavorite = (templateId: string) => {
        const newFavorites = new Set(favorites)
        if (newFavorites.has(templateId)) {
            newFavorites.delete(templateId)
        } else {
            newFavorites.add(templateId)
        }
        setFavorites(newFavorites)
        localStorage.setItem('favoriteTemplates', JSON.stringify([...newFavorites]))
    }

    // 分类列表
    const categories = [
        { id: 'all', name: '全部模板' },
        { id: 'favorites', name: '收藏夹' },
        { id: 'social', name: '社交媒体' },
        { id: 'presentation', name: '演示文稿' },
        { id: 'marketing', name: '营销物料' },
        { id: 'print', name: '印刷设计' }
    ]

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="space-x-2">
                    <Layout className="h-4 w-4" />
                    <span>模板库</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] h-[80vh]">
                <DialogHeader>
                    <DialogTitle>选择模板</DialogTitle>
                </DialogHeader>

                <div className="flex h-full">
                    {/* 左侧分类 */}
                    <div className="w-48 border-r pr-4">
                        <nav className="space-y-1">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`
                                        w-full px-3 py-2 text-left rounded-lg
                                        ${category === cat.id 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* 右侧内容 */}
                    <div className="flex-1 pl-4">
                        {/* 搜索栏 */}
                        <div className="mb-4 flex space-x-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="搜索模板..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={onCreateBlank}>
                                <Plus className="h-4 w-4 mr-2" />
                                空白设计
                            </Button>
                        </div>

                        {/* 模板网格 */}
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <ScrollArea className="h-[calc(80vh-140px)]">
                                <div className="grid grid-cols-3 gap-4">
                                    {filteredTemplates.map(template => (
                                        <div
                                            key={template.id}
                                            className="group relative rounded-lg border overflow-hidden"
                                        >
                                            <img
                                                src={template.thumbnail}
                                                alt={template.name}
                                                className="w-full aspect-[4/3] object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => onSelectTemplate(template.id)}
                                                    >
                                                        使用此模板
                                                    </Button>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleFavorite(template.id)}
                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white"
                                            >
                                                {favorites.has(template.id) ? (
                                                    <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                                                ) : (
                                                    <StarOff className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                            <div className="p-3 bg-white">
                                                <h3 className="font-medium">{template.name}</h3>
                                                <p className="text-sm text-gray-500">{template.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}