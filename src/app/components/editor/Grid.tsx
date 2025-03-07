'use client'

import { useEffect, useState } from 'react'
import type { Canvas, Line } from 'fabric/fabric-impl'

// 声明全局 fabric 变量
declare const fabric: any

interface GridProps {
  canvas: Canvas | null
  gridSize?: number
  gridColor?: string
  showSubgrid?: boolean
}

export function Grid({ 
  canvas, 
  gridSize = 20, 
  gridColor = '#e5e7eb',
  showSubgrid = true 
}: GridProps) {
  const [gridLines, setGridLines] = useState<Line[]>([])

  useEffect(() => {
    if (!canvas) return

    // 清除旧的网格线
    gridLines.forEach(line => canvas.remove(line))

    const newGridLines: Line[] = []
    const width = canvas.width || 800
    const height = canvas.height || 600

    // 创建主网格线
    for (let i = 0; i <= width; i += gridSize) {
      newGridLines.push(new fabric.Line([i, 0, i, height], {
        stroke: gridColor,
        selectable: false,
        evented: false,
        strokeWidth: i % (gridSize * 5) === 0 ? 0.5 : 0.2
      }))
    }

    for (let i = 0; i <= height; i += gridSize) {
      newGridLines.push(new fabric.Line([0, i, width, i], {
        stroke: gridColor,
        selectable: false,
        evented: false,
        strokeWidth: i % (gridSize * 5) === 0 ? 0.5 : 0.2
      }))
    }

    // 创建子网格线
    if (showSubgrid) {
      const subGridSize = gridSize / 2
      for (let i = 0; i <= width; i += subGridSize) {
        if (i % gridSize !== 0) {
          newGridLines.push(new fabric.Line([i, 0, i, height], {
            stroke: gridColor,
            selectable: false,
            evented: false,
            strokeWidth: 0.1,
            strokeDashArray: [1, 2]
          }))
        }
      }

      for (let i = 0; i <= height; i += subGridSize) {
        if (i % gridSize !== 0) {
          newGridLines.push(new fabric.Line([0, i, width, i], {
            stroke: gridColor,
            selectable: false,
            evented: false,
            strokeWidth: 0.1,
            strokeDashArray: [1, 2]
          }))
        }
      }
    }

    // 添加网格线到画布
    canvas.add(...newGridLines)
    setGridLines(newGridLines)

    // 将网格线移到底层
    newGridLines.forEach(line => {
      line.sendToBack()
    })

    canvas.renderAll()

    return () => {
      newGridLines.forEach(line => canvas.remove(line))
    }
  }, [canvas, gridSize, gridColor, showSubgrid])

  return null
}