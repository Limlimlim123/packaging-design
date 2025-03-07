'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useBrowseTemplateStore } from '@/store/browse/templateStore'

// 定义模板尺寸
const TEMPLATE_SIZES = [
  { 
    id: 'spring-couplet', 
    name: '春联', 
    width: 24, 
    height: 120,
    description: '传统对联尺寸'
  },
  { 
    id: 'door-god', 
    name: '门神', 
    width: 50, 
    height: 100,
    description: '标准门神尺寸'
  },
  { 
    id: 'blessing', 
    name: '福字', 
    width: 40, 
    height: 40,
    description: '方形福字'
  },
]

// 定义模板分类
const TEMPLATE_CATEGORIES = [
  { id: 'spring-festival', name: '春节模板' },
  { id: 'business', name: '商务模板' },
  { id: 'personal', name: '个人定制' }
]

export default function TemplateBrowsePage() {
  const router = useRouter()
  const {
    templates,
    loading,
    error,
    recentTemplates,
    selectedSize,
    setSelectedSize,
    fetchTemplates
  } = useBrowseTemplateStore()

  const [selectedCategory, setSelectedCategory] = useState('spring-festival')
  const [searchQuery, setSearchQuery] = useState('')

  // 初始化选中尺寸
  useEffect(() => {
    if (!selectedSize) {
      setSelectedSize(TEMPLATE_SIZES[0])
    }
  }, [selectedSize, setSelectedSize])

  // 加载模板数据
  useEffect(() => {
    if (selectedSize) {
      fetchTemplates(selectedCategory, selectedSize.id)
    }
  }, [selectedCategory, selectedSize, fetchTemplates])

  // 处理模板选择
  const handleTemplateSelect = (templateId: string) => {
    router.push(`/editor/new?template=${templateId}&size=${selectedSize?.id}`)
  }

  // 过滤模板
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 错误处理
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">加载失败: {error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => selectedSize && fetchTemplates(selectedCategory, selectedSize.id)}
        >
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">选择模板</h1>
        <p className="text-gray-500">选择合适的尺寸和模板开始设计</p>
      </div>

      {/* 最近使用的模板 */}
      {recentTemplates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">最近使用</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentTemplates.map(template => (
              <div
                key={template.id}
                className="relative aspect-[3/4] rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <Image
                  src={template.preview}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
                  <p className="text-xs text-white truncate">{template.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 尺寸选择 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">选择尺寸</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEMPLATE_SIZES.map((size) => (
            <Card 
              key={size.id}
              className={`cursor-pointer transition-all ${
                selectedSize?.id === size.id 
                  ? 'ring-2 ring-primary' 
                  : 'hover:border-primary'
              }`}
              onClick={() => setSelectedSize(size)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-medium">{size.name}</h3>
                  <p className="text-sm text-gray-500">
                    {size.width} x {size.height} cm
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {size.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索模板..."
            className="pl-9"
          />
        </div>
      </div>

      {/* 模板分类和列表 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="mb-6">
          {TEMPLATE_CATEGORIES.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {TEMPLATE_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id}>
            {loading ? (
              // 加载状态
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div 
                    key={n}
                    className="aspect-[3/4] bg-gray-100 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : filteredTemplates.length > 0 ? (
              // 模板列表
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className="group relative rounded-lg overflow-hidden border hover:border-primary transition-colors"
                  >
                    {/* 预览图 */}
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={template.preview}
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* 悬浮操作 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="secondary"
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        使用此模板
                      </Button>
                    </div>

                    {/* 模板信息 */}
                    <div className="p-3 bg-white">
                      <h3 className="font-medium truncate">{template.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedSize?.width} x {selectedSize?.height} cm
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 空状态
              <div className="text-center py-12">
                <p className="text-gray-500">暂无符合条件的模板</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}