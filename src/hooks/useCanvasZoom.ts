import { useState, useCallback } from 'react'
import type { Canvas } from 'fabric'

interface UseCanvasZoomOptions {
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
}

export function useCanvasZoom(
  canvas: Canvas | null, 
  options: UseCanvasZoomOptions = {}
) {
  const {
    minZoom = 25,
    maxZoom = 400,
    zoomStep = 5
  } = options

  const [zoom, setZoom] = useState(100)

  // 设置缩放
  const setCanvasZoom = useCallback((newZoom: number) => {
    if (!canvas) return

    const boundedZoom = Math.min(Math.max(minZoom, newZoom), maxZoom)
    const zoomRatio = boundedZoom / zoom

    canvas.setZoom(canvas.getZoom() * zoomRatio)
    setZoom(boundedZoom)
    canvas.renderAll()
  }, [canvas, zoom, minZoom, maxZoom])

  // 放大
  const zoomIn = useCallback(() => {
    setCanvasZoom(zoom + zoomStep)
  }, [zoom, zoomStep, setCanvasZoom])

  // 缩小
  const zoomOut = useCallback(() => {
    setCanvasZoom(zoom - zoomStep)
  }, [zoom, zoomStep, setCanvasZoom])

  // 适应画布
  const zoomToFit = useCallback(() => {
    if (!canvas) return

    const objects = canvas.getObjects()
    if (objects.length === 0) return

    const bound = canvas.getObjects().reduce((acc, obj) => {
      const objBound = obj.getBoundingRect()
      return {
        left: Math.min(acc.left, objBound.left),
        top: Math.min(acc.top, objBound.top),
        right: Math.max(acc.right, objBound.left + objBound.width),
        bottom: Math.max(acc.bottom, objBound.top + objBound.height)
      }
    }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity })

    const width = bound.right - bound.left
    const height = bound.bottom - bound.top

    const zoomX = (canvas.width! - 40) / width
    const zoomY = (canvas.height! - 40) / height
    const zoom = Math.min(zoomX, zoomY) * 100

    setCanvasZoom(zoom)
  }, [canvas, setCanvasZoom])

  return {
    zoom,
    setZoom: setCanvasZoom,
    zoomIn,
    zoomOut,
    zoomToFit
  }
}