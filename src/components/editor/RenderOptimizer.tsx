'use client'

import { useEffect } from 'react'
import { fabric } from 'fabric'
import debounce from 'lodash/debounce'

interface RenderOptimizerProps {
  canvas: fabric.Canvas | null
}

export function RenderOptimizer({ canvas }: RenderOptimizerProps) {
  useEffect(() => {
    if (!canvas) return

    // 使用 requestAnimationFrame 优化渲染
    let renderRequested = false

    const requestRender = () => {
      if (!renderRequested) {
        renderRequested = true
        requestAnimationFrame(() => {
          canvas.renderAll()
          renderRequested = false
        })
      }
    }

    // 优化缩放时的渲染
    const debouncedRender = debounce(requestRender, 16) // ~60fps

    canvas.on('object:scaling', () => {
      debouncedRender()
    })

    canvas.on('object:moving', () => {
      debouncedRender()
    })

    return () => {
      debouncedRender.cancel()
    }
  }, [canvas])

  return null
}