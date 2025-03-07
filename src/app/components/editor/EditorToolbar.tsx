'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Save, 
  ArrowLeft,
  Undo2,
  Redo2,
  Grid,
  Ruler,
  ZoomIn,
  ZoomOut,
  Copy,
  Trash2,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignEndVertical,
} from 'lucide-react'
import { ExportDialog } from '@/app/editor/ExportDialog'
import { useEditorStore } from '@/store/editor/editorStore'
import { useToast } from '@/components/ui/use-toast'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function EditorToolbar() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const { 
    canvas, 
    showGrid, 
    setShowGrid, 
    showGuides, 
    setShowGuides,
    canUndo,
    canRedo,
    undo,
    redo,
    zoom,
    setZoom,
    saveDesign,
    designId
  } = useEditorStore()

  const handleSave = async () => {
    if (!canvas) return
    
    try {
      setSaving(true)
      await saveDesign()
      toast({
        title: '成功',
        description: '保存成功'
      })
    } catch (error) {
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAlign = (direction: string) => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    switch (direction) {
      case 'left':
        activeObject.set('left', 0)
        break
      case 'center':
        activeObject.centerH()
        break
      case 'right':
        activeObject.set('left', canvas.width! - activeObject.width! * activeObject.scaleX!)
        break
      case 'top':
        activeObject.set('top', 0)
        break
      case 'middle':
        activeObject.centerV()
        break
      case 'bottom':
        activeObject.set('top', canvas.height! - activeObject.height! * activeObject.scaleY!)
        break
    }
    canvas.renderAll()
  }

  const handleDelete = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.renderAll()
    }
  }

  const handleDuplicate = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20
        })
        canvas.add(cloned)
        canvas.setActiveObject(cloned)
        canvas.renderAll()
      })
    }
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.1))
  }

  return (
    <div className="h-14 border-b bg-white flex items-center justify-between px-4">
      {/* 左侧按钮组 */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/designs')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>撤销 (Ctrl+Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>重做 (Ctrl+Y)</TooltipContent>
        </Tooltip>
      </div>

      {/* 中间按钮组 */}
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGrid(!showGrid)}
              className={showGrid ? 'bg-gray-100' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>显示网格</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGuides(!showGuides)}
              className={showGuides ? 'bg-gray-100' : ''}
            >
              <Ruler className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>显示参考线</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 0.1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-16 text-center text-sm">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-1">
          {/* 对齐按钮组 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAlign('left')}
          >
            <AlignStartHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAlign('center')}
          >
            <AlignHorizontalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAlign('right')}
          >
            <AlignEndHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAlign('top')}
          >
            <AlignStartVertical className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAlign('middle')}
          >
            <AlignVerticalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAlign('bottom')}
          >
            <AlignEndVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 右侧按钮组 */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDuplicate}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        {designId && <ExportDialog designId={designId} />}
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  )
}