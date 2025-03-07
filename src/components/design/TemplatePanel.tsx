'use client'

import { useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus } from 'lucide-react'

interface Template {
  id: string
  name: string
  thumbnail: string
  category: string
  json: string
}

const CATEGORIES = [
  '全部',
  '包装盒',
  '标签',
  '海报',
  '名片',
  '横幅'
]

export function TemplatePanel() {
  const { canvas, loadTemplate } = useEditorStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === '全部' || 
      template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleTemplateSelect = async (template: Template) => {
    if (!canvas) return
    
    try {
      setLoading(true)
      await loadTemplate(template.json)
    } catch (error) {
      console.error('Failed to load template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAsTemplate = async () => {
    if (!canvas) return

    try {
      setLoading(true)
      const json = JSON.stringify(canvas.toJSON())
      const thumbnail = canvas.toDataURL({
        format: 'png',
        quality: 0.8,
        multiplier: 0.5
      })

      // TODO: 实现模板保存逻辑
      
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索模板..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="browse">
        <TabsList className="w-full">
          <TabsTrigger value="browse" className="flex-1">浏览模板</TabsTrigger>
          <TabsTrigger value="saved" className="flex-1">已保存</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <ScrollArea className="h-[500px]">
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border cursor-pointer hover:border-primary"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm">
                      {template.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="saved">
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSaveAsTemplate}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              保存当前设计为模板
            </Button>

            <ScrollArea className="h-[450px]">
              <div className="grid grid-cols-2 gap-4">
                {/* 已保存的模板列表 */}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}