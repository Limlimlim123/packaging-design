'use client'

import { useEffect, useState } from 'react'
import type { Canvas, Line } from 'fabric/fabric-impl'

// 声明全局 fabric 变量
declare const fabric: any

interface GuidelinesProps {
  canvas?: Canvas | null
}

export function Guidelines({ canvas }: GuidelinesProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedLine, setDraggedLine] = useState<Line | null>(null)

  useEffect(() => {
    if (!canvas) return

    const handleMouseDown = (e: fabric.IEvent) => {
      const target = e.target as Line
      if (target && target.data?.isGuideline) {
        setIsDragging(true)
        setDraggedLine(target)
      }
    }

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!isDragging || !draggedLine) return

      const pointer = canvas.getPointer(e.e)
      if (draggedLine.data?.orientation === 'horizontal') {
        draggedLine.set({ y1: pointer.y, y2: pointer.y })
      } else {
        draggedLine.set({ x1: pointer.x, x2: pointer.x })
      }
      draggedLine.setCoords()
      canvas.renderAll()
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDraggedLine(null)
    }

    // 创建垂直参考线
    const verticalGuideline = new fabric.Line([100, 0, 100, canvas.height!], {
      stroke: '#00aeff',
      strokeWidth: 1,
      selectable: true,
      evented: true,
      hasBorders: false,
      hasControls: false,
      lockMovementY: true,
      data: { isGuideline: true, orientation: 'vertical' }
    })

    // 创建水平参考线
    const horizontalGuideline = new fabric.Line([0, 100, canvas.width!, 100], {
      stroke: '#00aeff',
      strokeWidth: 1,
      selectable: true,
      evented: true,
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      data: { isGuideline: true, orientation: 'horizontal' }
    })

    const guidelines = [verticalGuideline, horizontalGuideline]

    // 添加参考线到画布
    canvas.add(...guidelines)

    // 绑定事件
    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      // 清理事件监听
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)

      // 移除参考线
      guidelines.forEach(line => canvas.remove(line))
    }
  }, [canvas, isDragging, draggedLine])

  return null
}