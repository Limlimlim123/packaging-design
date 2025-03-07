'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { 
    Folder, 
    Image, 
    Type, 
    Plus,
    Edit,
    Trash2
} from 'lucide-react'

interface Category {
    id: string
    name: string
    type: 'folder' | 'smart' // 普通文件夹或智能分类
    count: number
}

export function AssetCategories() {
    const [categories, setCategories] = useState<Category[]>([
        { id: 'all', name: '全部素材', type: 'smart', count: 0 },
        { id: 'images', name: '图片', type: 'smart', count: 0 },
        { id: 'logos', name: 'Logo', type: 'smart', count: 0 },
        { id: 'texts', name: '文字', type: 'smart', count: 0 }
    ])
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [newCategoryName, setNewCategoryName] = useState('')

    // 添加新分类
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            })

            if (response.ok) {
                const category = await response.json()
                setCategories(prev => [...prev, category])
                setNewCategoryName('')
            }
        } catch (error) {
            console.error('Failed to create category:', error)
        }
    }

    return (
        <div className="space-y-1">
            {/* 分类列表 */}
            {categories.map(category => (
                <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    className="w-full justify-between"
                    onClick={() => setSelectedCategory(category.id)}
                >
                    <div className="flex items-center">
                        {category.type === 'smart' ? (
                            category.id === 'images' ? (
                                <Image className="w-4 h-4 mr-2" />
                            ) : category.id === 'logos' ? (
                                <Image className="w-4 h-4 mr-2" />
                            ) : (
                                <Type className="w-4 h-4 mr-2" />
                            )
                        ) : (
                            <Folder className="w-4 h-4 mr-2" />
                        )}
                        {category.name}
                    </div>
                    <span className="text-sm text-gray-500">
                        {category.count}
                    </span>
                </Button>
            ))}

            {/* 添加分类按钮 */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        添加分类
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>新建分类</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="分类名称"
                        />
                        <Button 
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim()}
                        >
                            创建
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}