'use client'

import { useState, useEffect } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Design2DViewer } from '../viewer/Design2DViewer'
import { ThreeDPreview } from '../viewer/ThreeDPreview'
import { Eye, RefreshCw, Download } from 'lucide-react'

export function PreviewPanel() {
  const { canvas, size } = useEditorStore()
  const [preview2D, setPreview2D] = useState<string>('')
  const [preview3D, setPreview3D] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const updatePreviews = async () => {
    if (!canvas) return
    
    try {
      setLoading(true)
      
      // 生成 2D 预览
      const preview2DData = canvas.toDataURL({
        format: 'png',
        quality: 1
      })
      setPreview2D(preview2DData)

      // 生成 3D 预览（这里需要根据实际需求调整）
      // 示例：将 2D 预览应用到 3D 模型上
      setPreview3D(preview2DData)
    } catch (error) {
      console.error('生成预览失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 监听画布变化，自动更新预览
  useEffect(() => {
    if (!canvas) return

    const handleUpdate = () => {
      updatePreviews()
    }

    canvas.on('object:modified', handleUpdate)
    canvas.on('object:added', handleUpdate)
    canvas.on('object:removed', handleUpdate)

    return () => {
      canvas.off('object:modified', handleUpdate)
      canvas.off('object:added', handleUpdate)
      canvas.off('object:removed', handleUpdate)
    }
  }, [canvas])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium">预览</h2>
      </div>

      <Tabs defaultValue="2d" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start px-4 border-b rounded-none">
          <TabsTrigger value="2d">2D 预览</TabsTrigger>
          <TabsTrigger value="3d">3D 预览</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="2d" className="mt-0">
            {preview2D ? (
              <Design2DViewer
                width={size?.width || 800}
                height={size?.height || 600}
                preview={preview2D}
                showDimensions
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px] bg-gray-50 rounded-lg">
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="3d" className="mt-0">
            {preview3D ? (
              <ThreeDPreview
                width={size?.width || 800}
                height={size?.height || 600}
                texture={preview3D}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px] bg-gray-50 rounded-lg">
                <Eye className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </TabsContent>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={updatePreviews}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新预览
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // 下载预览图
                const link = document.createElement('a')
                link.download = 'preview.png'
                link.href = preview2D
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              disabled={!preview2D}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Tabs>
    </div>
  )
}