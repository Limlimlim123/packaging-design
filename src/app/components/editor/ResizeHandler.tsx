'use client'

import { useEffect, useCallback } from 'react'
import { fabric } from 'fabric'
import debounce from 'lodash/debounce'

interface ResizeHandlerProps {
  canvas: fabric.Canvas
  onResize?: (width: number, height: number) => void
}

export function ResizeHandler({ canvas, onResize }: ResizeHandlerProps) {
  // 计算画布尺寸
  const calculateSize = useCallback(() => {
    const container = canvas.wrapperEl?.parentElement
    if (!container) return

    const padding = 32 // 考虑容器内边距
    const maxWidth = container.clientWidth - padding
    const maxHeight = container.clientHeight - padding
    const ratio = 4 / 3 // 保持 4:3 的宽高比

    let width = maxWidth
    let height = maxWidth / ratio

    if (height > maxHeight) {
      height = maxHeight
      width = maxHeight * ratio
    }

    return { width, height }
  }, [canvas])

  // 处理调整大小
  const handleResize = useCallback(
    debounce(() => {
      const size = calculateSize()
      if (!size) return

      canvas.setDimensions(size)
      canvas.renderAll()
      onResize?.(size.width, size.height)
    }, 200),
    [canvas, calculateSize, onResize]
  )

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  return null
}