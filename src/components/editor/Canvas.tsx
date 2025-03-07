'use client'

import { useEffect, useRef } from 'react'
import { fabric } from 'fabric'
import { ResizeHandler } from './ResizeHandler'

interface CanvasProps {
  width: number
  height: number
  onSelect?: (obj: fabric.Object | null) => void
}

export function Canvas({ width, height, onSelect }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editorRef = useRef<fabric.Canvas | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // 初始化画布
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      // 启用触控支持
      enableRetinaScaling: true,
      allowTouchScrolling: true
    })

    // 配置画布交互选项
    canvas.setDimensions({
      width: width,
      height: height
    })

    canvas.on('selection:created', (e) => {
      onSelect?.(e.target || null)
    })

    canvas.on('selection:cleared', () => {
      onSelect?.(null)
    })

    // 设置触控事件处理
    canvas.on('mouse:wheel', function(opt) {
      const delta = opt.e.deltaY
      let zoom = canvas.getZoom()
      zoom *= 0.999 ** delta
      if (zoom > 0.2 && zoom < 5) {
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
      }
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    editorRef.current = canvas

    return () => {
      canvas.dispose()
    }
  }, [width, height])

  return (
    <div className="relative">
      <canvas ref={canvasRef} />
      <ResizeHandler canvas={editorRef.current} />
    </div>
  )
}