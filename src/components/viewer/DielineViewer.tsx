'use client'

import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import { DielineGenerator } from '@/lib/dielineGenerator'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface DielineViewerProps {
  width: number
  height: number
  depth?: number
  type: 'box' | 'bag'
  showMeasurements?: boolean
  onDownload?: () => void
}

export function DielineViewer({
  width,
  height,
  depth = 0,
  type = 'box',
  showMeasurements = true,
  onDownload
}: DielineViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas>()

  useEffect(() => {
    if (!canvasRef.current) return

    // 计算画布尺寸
    const padding = 50 // 边距
    const canvasWidth = type === 'box' ? 
      width + (depth * 2) + (padding * 2) : 
      width + (padding * 2)
    const canvasHeight = type === 'box' ?
      height + (depth * 2) + (padding * 2) :
      height + (padding * 2)

    // 初始化画布
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
      selection: false
    })
    fabricRef.current = canvas

    // 生成刀版图
    const generator = new DielineGenerator(canvas, {
      width,
      height,
      depth,
      type,
      bleed: 3,
      safeZone: 5,
      foldLines: true,
      cutLines: true
    })

    // 添加刀版图并居中
    const dieline = generator.generate()
    dieline.set({
      left: padding,
      top: padding
    })
    canvas.add(dieline)

    // 添加尺寸标注
    if (showMeasurements) {
      const addDimension = (start: [number, number], end: [number, number], label: string) => {
        // 创建标注线
        const line = new fabric.Line([...start, ...end], {
          stroke: '#666',
          strokeWidth: 1,
          selectable: false
        })

        // 创建标注文字
        const text = new fabric.Text(label, {
          left: (start[0] + end[0]) / 2,
          top: (start[1] + end[1]) / 2,
          fontSize: 12,
          fill: '#666',
          backgroundColor: '#fff',
          selectable: false
        })

        canvas.add(line, text)
      }

      // 添加宽度标注
      addDimension(
        [padding, canvasHeight - 20],
        [padding + width, canvasHeight - 20],
        `${width}mm`
      )

      // 添加高度标注
      addDimension(
        [20, padding],
        [20, padding + height],
        `${height}mm`
      )

      // 如果是盒型，添加深度标注
      if (type === 'box' && depth) {
        addDimension(
          [padding + width + 10, padding],
          [padding + width + 10, padding + depth],
          `${depth}mm`
        )
      }
    }

    canvas.renderAll()

    return () => {
      canvas.dispose()
    }
  }, [width, height, depth, type, showMeasurements])

  // 下载刀版图
  const handleDownload = () => {
    if (!fabricRef.current) return

    const dataURL = fabricRef.current.toDataURL({
      format: 'png',
      quality: 1
    })

    const link = document.createElement('a')
    link.download = `dieline-${type}-${width}x${height}${depth ? 'x' + depth : ''}.png`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    onDownload?.()
  }

  return (
    <div className="space-y-4">
      <div className="relative border rounded-lg overflow-hidden bg-white">
        <canvas ref={canvasRef} />
        <div className="absolute bottom-2 right-2 space-y-1 text-xs text-gray-500">
          <div>{type === 'box' ? '盒型展开图' : '袋型展开图'}</div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-red-500" /> 出血线
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-500" /> 裁切线
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500 border-dashed" /> 折线
            </span>
          </div>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleDownload}
      >
        <Download className="w-4 h-4 mr-2" />
        下载刀版图
      </Button>
    </div>
  )
}