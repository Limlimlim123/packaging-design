'use client'

import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'

interface Design2DViewerProps {
  width: number
  height: number
  preview: string
  showDimensions?: boolean
  showRulers?: boolean
  backgroundColor?: string
}

export function Design2DViewer({
  width,
  height,
  preview,
  showDimensions = true,
  showRulers = true,
  backgroundColor = '#ffffff'
}: Design2DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    // 计算适合容器的缩放比例
    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const scale = Math.min(
      (containerWidth - 40) / width,
      (containerHeight - 40) / height
    )

    // 初始化预览画布
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: width * scale,
      height: height * scale,
      selection: false,
      renderOnAddRemove: false,
      backgroundColor
    })

    // 加载预览图
    fabric.Image.fromURL(preview, (img) => {
      img.scale(scale)
      canvas.add(img)
      canvas.renderAll()
    })

    // 添加标尺
    if (showRulers) {
      const rulerSize = 20
      const rulerColor = '#e5e7eb'
      const textColor = '#6b7280'

      // 水平标尺
      for (let i = 0; i <= width; i += 50) {
        const x = i * scale
        canvas.add(new fabric.Line([x, 0, x, rulerSize], {
          stroke: rulerColor,
          selectable: false
        }))
        if (i > 0) {
          canvas.add(new fabric.Text(i.toString(), {
            left: x - 10,
            top: 5,
            fontSize: 10,
            fill: textColor,
            selectable: false
          }))
        }
      }

      // 垂直标尺
      for (let i = 0; i <= height; i += 50) {
        const y = i * scale
        canvas.add(new fabric.Line([0, y, rulerSize, y], {
          stroke: rulerColor,
          selectable: false
        }))
        if (i > 0) {
          canvas.add(new fabric.Text(i.toString(), {
            left: 5,
            top: y - 5,
            fontSize: 10,
            fill: textColor,
            selectable: false
          }))
        }
      }
    }

    // 添加尺寸标注
    if (showDimensions) {
      const dimensionColor = '#6b7280'
      const fontSize = 12

      // 宽度标注
      canvas.add(new fabric.Text(`${width}px`, {
        left: (width * scale) / 2 - 20,
        top: -25,
        fontSize,
        fill: dimensionColor,
        selectable: false
      }))

      // 高度标注
      canvas.add(new fabric.Text(`${height}px`, {
        left: -35,
        top: (height * scale) / 2 - 10,
        fontSize,
        fill: dimensionColor,
        angle: -90,
        selectable: false
      }))
    }

    return () => {
      canvas.dispose()
    }
  }, [width, height, preview, showDimensions, showRulers, backgroundColor])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg p-4"
    >
      <canvas ref={canvasRef} />
    </div>
  )
}