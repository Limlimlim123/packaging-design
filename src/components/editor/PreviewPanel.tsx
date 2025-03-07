'use client'

import { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Preview3D } from '@/components/Preview3D'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PreviewPanel() {
  const { canvas } = useEditorStore()
  const [preview2D, setPreview2D] = useState<string>('')
  const [preview3D, setPreview3D] = useState<string>('')

  useEffect(() => {
    if (!canvas) return

    const updatePreviews = () => {
      // 2D预览
      setPreview2D(canvas.toDataURL({
        format: 'png',
        quality: 1
      }))

      // 3D预览
      setPreview3D(canvas.toDataURL({
        format: 'png',
        quality: 1
      }))
    }

    canvas.on('after:render', updatePreviews)
    return () => {
      canvas.off('after:render', updatePreviews)
    }
  }, [canvas])

  return (
    <div className="w-full h-full">
      <Tabs defaultValue="2d">
        <TabsList>
          <TabsTrigger value="2d">平面预览</TabsTrigger>
          <TabsTrigger value="3d">3D预览</TabsTrigger>
        </TabsList>
        <TabsContent value="2d">
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={preview2D}
              alt="2D预览"
              className="w-full h-full object-contain"
            />
          </div>
        </TabsContent>
        <TabsContent value="3d">
          <div className="aspect-square">
            <Preview3D
              texture={preview3D}
              width={1}
              height={1}
              depth={0.2}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}