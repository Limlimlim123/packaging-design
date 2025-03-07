'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'

interface DesignGridProps {
  width: number
  height: number
  size?: number
  color?: string
}

export function DesignGrid({ 
  width, 
  height, 
  size = 20, 
  color = 'rgba(0, 0, 0, 0.1)' 
}: DesignGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { showGrid } = useEditorStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除画布
    ctx.clearRect(0, 0, width, height)

    if (!showGrid) return

    // 绘制网格
    ctx.beginPath()
    ctx.strokeStyle = color

    // 绘制垂直线
    for (let x = size; x < width; x += size) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }

    // 绘制水平线
    for (let y = size; y < height; y += size) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }

    ctx.stroke()
  }, [width, height, size, color, showGrid])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        opacity: showGrid ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out'
      }}
    />
  )
}