'use client'

import { useState, useEffect } from 'react'
import { UploadZone } from './UploadZone'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, Grid, List } from 'lucide-react'

interface Asset {
    id: string
    name: string
    url: string
    type: string
    createdAt: string
}

export function AssetLibrary() {
    const [assets, setAssets] = useState<Asset[]>([])
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [search, setSearch] = useState('')

    // 加载用户素材
    useEffect(() => {
        fetchAssets()
    }, [])

    const fetchAssets = async () => {
        try {
            const response = await fetch('/api/assets')
            if (response.ok) {
                const data = await response.json()
                setAssets(data)
            }
        } catch (error) {
            console.error('Failed to fetch assets:', error)
        }
    }

    // 处理素材拖拽
    const handleDragStart = (e: React.DragEvent, asset: Asset) => {
        e.dataTransfer.setData('application/json', JSON.stringify(asset))
    }

    return (
        <div className="h-full flex flex-col">
            {/* 搜索栏 */}
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="搜索素材..."
                        className="pl-9"
                    />
                </div>
            </div>

            {/* 视图切换 */}
            <div className="p-4 border-b flex justify-between items-center">
                <div className="space-x-1">
                    <Button
                        variant={view === 'grid' ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => setView('grid')}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === 'list' ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => setView('list')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* 素材展示 */}
            <div className="flex-1 overflow-auto p-4">
                {view === 'grid' ? (
                    <div className="grid grid-cols-2 gap-4">
                        {assets.map(asset => (
                            <div
                                key={asset.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, asset)}
                                className="relative aspect-square rounded-lg overflow-hidden border hover:border-blue-500 transition-colors cursor-move"
                            >
                                <img
                                    src={asset.url}
                                    alt={asset.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {assets.map(asset => (
                            <div
                                key={asset.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, asset)}
                                className="flex items-center p-2 border rounded hover:border-blue-500 transition-colors cursor-move"
                            >
                                <img
                                    src={asset.url}
                                    alt={asset.name}
                                    className="w-12 h-12 object-cover rounded"
                                />
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{asset.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(asset.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 上传区域 */}
            <div className="p-4 border-t">
                <UploadZone
                    onUploadSuccess={(asset) => {
                        setAssets(prev => [asset, ...prev])
                    }}
                />
            </div>
        </div>
    )
}

export function AssetLibrary() {
    // ... 前面的状态保持不变 ...

    return (
        <div className="h-full flex">
            {/* 左侧分类 */}
            <div className="w-48 border-r p-4">
                <AssetCategories
                    onSelect={(categoryId) => {
                        // 切换分类时重新加载素材
                        fetchAssets(categoryId)
                    }}
                />
            </div>

            {/* 右侧内容 */}
            <div className="flex-1 flex flex-col">
                {/* 工具栏 */}
                <div className="p-4 border-b flex justify-between items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="搜索素材..."
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Upload className="w-4 h-4 mr-2" />
                                    上传
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>批量上传</DialogTitle>
                                </DialogHeader>
                                <BatchUpload
                                    onComplete={(assets) => {
                                        // 上传完成后刷新列表
                                        setAssets(prev => [...assets, ...prev])
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                        <div className="space-x-1">
                            <Button
                                variant={view === 'grid' ? 'default' : 'ghost'}
                                size="icon"
                                onClick={() => setView('grid')}
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={view === 'list' ? 'default' : 'ghost'}
                                size="icon"
                                onClick={() => setView('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 素材展示区 */}
                {/* ... 保持不变 ... */}
            </div>
        </div>
    )
}