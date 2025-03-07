'use client'

import { useEffect } from 'react'
import { fabric } from 'fabric'

interface TouchHandlerProps {
  canvas: fabric.Canvas | null
}

export function TouchHandler({ canvas }: TouchHandlerProps) {
  useEffect(() => {
    if (!canvas) return

    let touchStartX = 0
    let touchStartY = 0
    let scaling = false
    let lastDistance = 0

    // 处理触摸开始
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        scaling = true
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        lastDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
      } else if (e.touches.length === 1) {
        const touch = e.touches[0]
        touchStartX = touch.clientX
        touchStartY = touch.clientY
      }
    }

    // 处理触摸移动
    const handleTouchMove = (e: TouchEvent) => {
      if (!scaling && e.touches.length === 1) {
        // 单指拖动
        const touch = e.touches[0]
        const deltaX = touch.clientX - touchStartX
        const deltaY = touch.clientY - touchStartY
        
        const obj = canvas.getActiveObject()
        if (obj) {
          obj.left! += deltaX / canvas.getZoom()
          obj.top! += deltaY / canvas.getZoom()
          obj.setCoords()
          canvas.renderAll()
        }
        
        touchStartX = touch.clientX
        touchStartY = touch.clientY
      } else if (scaling && e.touches.length === 2) {
        // 双指缩放
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        )
        
        const scale = distance / lastDistance
        const obj = canvas.getActiveObject()
        if (obj) {
          const newScaleX = obj.scaleX! * scale
          const newScaleY = obj.scaleY! * scale
          
          // 限制缩放范围
          if (newScaleX > 0.2 && newScaleX < 5) {
            obj.scale(newScaleX)
            canvas.renderAll()
          }
        }
        
        lastDistance = distance
      }
      e.preventDefault()
    }

    // 处理触摸结束
    const handleTouchEnd = () => {
      scaling = false
      canvas.renderAll()
    }

    // 添加事件监听
    canvas.upperCanvasEl.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.upperCanvasEl.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.upperCanvasEl.addEventListener('touchend', handleTouchEnd)

    return () => {
      canvas.upperCanvasEl.removeEventListener('touchstart', handleTouchStart)
      canvas.upperCanvasEl.removeEventListener('touchmove', handleTouchMove)
      canvas.upperCanvasEl.removeEventListener('touchend', handleTouchEnd)
    }
  }, [canvas])

  return null
}