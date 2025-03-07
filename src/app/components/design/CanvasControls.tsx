'use client'

import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Grid3X3, 
  Ruler,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from '@/components/ui/tooltip'

export function CanvasControls() {
  const { 
    canvas, 
    zoom, 
    setZoom,
    showGrid,
    setShowGrid,
    showGuides,
    setShowGuides
  } = useEditorStore()

  const handleZoomIn = () => {
    if (!canvas) return
    const newZoom = Math.min(zoom + 0.1, 3)
    canvas.setZoom(newZoom)
    setZoom(newZoom)
  }

  const handleZoomOut = () => {
    if (!canvas) return
    const newZoom = Math.max(zoom - 0.1, 0.1)
    canvas.setZoom(newZoom)
    setZoom(newZoom)
  }

  const handleZoomChange = (values: number[]) => {
    // 确保数组不为空且第一个值是数字
    if (!Array.isArray(values) || values.length === 0) return
    const value = values[0]
    if (typeof value !== 'number') return

    const newZoom = value / 100
    if (canvas) {
      canvas.setZoom(newZoom)
    }
    setZoom(newZoom)
  }

  const handleRotate = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.rotate((activeObject.angle || 0) + 90)
      canvas.renderAll()
    }
  }

  const handleFlipHorizontal = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.set('flipX', !activeObject.flipX)
      canvas.renderAll()
    }
  }

  const handleFlipVertical = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.set('flipY', !activeObject.flipY)
      canvas.renderAll()
    }
  }

  const handleCenterHorizontally = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      const canvasCenter = canvas.getCenter()
      activeObject.set({
        left: canvasCenter.left
      })
      activeObject.setCoords()
      canvas.renderAll()
    }
  }

  const handleCenterVertically = () => {
    if (!canvas) return
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      const canvasCenter = canvas.getCenter()
      activeObject.set({
        top: canvasCenter.top
      })
      activeObject.setCoords()
      canvas.renderAll()
    }
  }

  return (
    <TooltipProvider>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white rounded-lg shadow-lg p-2">
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? 'bg-gray-100' : ''}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showGrid ? '隐藏网格' : '显示网格'}
            </TooltipContent>
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
            <TooltipContent>
              {showGuides ? '隐藏参考线' : '显示参考线'}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>旋转 90°</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFlipHorizontal}
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>水平翻转</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFlipVertical}
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>垂直翻转</TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCenterHorizontally}
              >
                <AlignHorizontalJustifyCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>水平居中</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCenterVertically}
              >
                <AlignVerticalJustifyCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>垂直居中</TooltipContent>
          </Tooltip>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoom <= 0.1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>缩小</TooltipContent>
          </Tooltip>

          <Slider
            value={[zoom * 100]}
            onValueChange={handleZoomChange}
            min={10}
            max={300}
            step={1}
            className="w-32"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>放大</TooltipContent>
          </Tooltip>

          <span className="text-sm text-gray-500 w-16">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>
    </TooltipProvider>
  )
}