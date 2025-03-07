'use client'

import { useEffect } from 'react'
import { fabric } from 'fabric'

interface TouchHandlerProps {
  canvas: fabric.Canvas
}

export function TouchHandler({ canvas }: TouchHandlerProps) {
  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0
    let isDragging = false

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return

      const touch = e.touches[0]
      touchStartX = touch.clientX
      touchStartY = touch.clientY
      isDragging = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartX
      const deltaY = touch.clientY - touchStartY

      canvas.relativePan(new fabric.Point(deltaX, deltaY))
      touchStartX = touch.clientX
      touchStartY = touch.clientY
    }

    const handleTouchEnd = () => {
      isDragging = false
    }

    // 添加触摸事件监听
    const canvasElement = canvas.wrapperEl
    if (canvasElement) {
      canvasElement.addEventListener('touchstart', handleTouchStart)
      canvasElement.addEventListener('touchmove', handleTouchMove)
      canvasElement.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('touchstart', handleTouchStart)
        canvasElement.removeEventListener('touchmove', handleTouchMove)
        canvasElement.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [canvas])

  return null
}