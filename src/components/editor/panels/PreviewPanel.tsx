'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BoxPreview } from './Preview3D/BoxPreview'
import { DielineGenerator } from '@/lib/dielineGenerator'
import { useEditorStore } from '@/store/editor/editorStore'

export function PreviewPanel() {
  const [activeTab, setActiveTab] = useState('3d')
  const [showDieline, setShowDieline] = useState(false)
  const { canvas } = useEditorStore()

  const [dimensions, setDimensions] = useState({
    width: 100,
    height: 100,
    depth: 30
  })

  const handleDielineToggle = () => {
    if (!canvas) return

    if (showDieline) {
      // 移除刀版图
      const dieline = canvas.getObjects().find(obj => obj.data?.type === 'dieline')
      if (dieline) {
        canvas.remove(dieline)
      }
    } else {
      // 生成并添加刀版图
      const generator = new DielineGenerator(canvas, {
        ...dimensions,
        type: 'box',
        bleed: 3,
        safeZone: 5,
        foldLines: true,
        cutLines: true
      })

      const dieline = generator.generate()
      dieline.set('data', { type: 'dieline' })
      canvas.add(dieline)
      canvas.sendToBack(dieline)
    }

    setShowDieline(!showDieline)
    canvas.renderAll()
  }

  const handleDimensionChange = (key: keyof typeof dimensions) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setDimensions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-4 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="3d">3D预览</TabsTrigger>
          <TabsTrigger value="dieline">刀版图</TabsTrigger>
        </TabsList>

        <TabsContent value="3d" className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-sm">宽度 (mm)</label>
              <Input
                type="number"
                value={dimensions.width}
                onChange={handleDimensionChange('width')}
              />
            </div>
            <div>
              <label className="text-sm">高度 (mm)</label>
              <Input
                type="number"
                value={dimensions.height}
                onChange={handleDimensionChange('height')}
              />
            </div>
            <div>
              <label className="text-sm">深度 (mm)</label>
              <Input
                type="number"
                value={dimensions.depth}
                onChange={handleDimensionChange('depth')}
              />
            </div>
          </div>

          <BoxPreview
            width={dimensions.width}
            height={dimensions.height}
            depth={dimensions.depth}
            texture={canvas?.toDataURL() || ''}
          />
        </TabsContent>

        <TabsContent value="dieline" className="space-y-4">
          <Button
            onClick={handleDielineToggle}
            variant={showDieline ? 'destructive' : 'default'}
          >
            {showDieline ? '隐藏刀版图' : '显示刀版图'}
          </Button>

          {showDieline && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                红线：出血线 (3mm)
                <br />
                蓝线：裁切线
                <br />
                绿线：折线
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}