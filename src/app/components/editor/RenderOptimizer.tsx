'use client'

import { useEffect } from 'react'
import { fabric } from 'fabric'
import debounce from 'lodash/debounce'

interface RenderOptimizerProps {
  canvas: fabric.Canvas
}

export function RenderOptimizer({ canvas }: RenderOptimizerProps) {
  useEffect(() => {
    // 优化渲染性能
    const debouncedRender = debounce(() => {
      canvas.renderAll()
    }, 16) // 约60fps

    const handleObjectModifying = () => {
      canvas.renderOnAddRemove = false
      debouncedRender()
    }

    const handleObjectModified = () => {
      canvas.renderOnAddRemove = true
      canvas.renderAll()
    }

    canvas.on('object:moving', handleObjectModifying)
    canvas.on('object:scaling', handleObjectModifying)
    canvas.on('object:rotating', handleObjectModifying)
    canvas.on('object:modified', handleObjectModified)

    return () => {
      canvas.off('object:moving', handleObjectModifying)
      canvas.off('object:scaling', handleObjectModifying)
      canvas.off('object:rotating', handleObjectModifying)
      canvas.off('object:modified', handleObjectModified)
      debouncedRender.cancel()
    }
  }, [canvas])

  return null
}