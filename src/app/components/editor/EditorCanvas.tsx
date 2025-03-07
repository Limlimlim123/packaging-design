'use client'

import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Grid } from './Grid'
import { Guidelines } from './Guidelines'
import { debounce } from 'lodash'

// 声明全局 fabric 变量
declare const fabric: any

// 定义画布历史记录扩展
interface ExtendedCanvas extends fabric.Canvas {
  historyUndo: string[]
  historyRedo: string[]
}

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { canvas, setCanvas, width, height, showGrid, showGuides } = useEditorStore()
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (!canvasRef.current || canvas) {
      return undefined // 添加明确的返回值
    }

    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: width || 800,
      height: height || 600,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      stopContextMenu: true
    }) as ExtendedCanvas
    
    // 添加历史记录功能
    newCanvas.historyUndo = []
    newCanvas.historyRedo = []
    
    // 监听对象修改
    newCanvas.on('object:modified', () => {
      newCanvas.historyUndo.push(JSON.stringify(newCanvas))
      newCanvas.historyRedo = []
    })

    // 缩放处理
    newCanvas.on('mouse:wheel', (opt: { e: WheelEvent }) => {
      const delta = opt.e.deltaY
      let newZoom = zoom * 0.999 ** delta
      
      // 限制缩放范围
      newZoom = Math.min(Math.max(0.1, newZoom), 20)
      
      newCanvas.zoomToPoint(
        { x: opt.e.offsetX, y: opt.e.offsetY },
        newZoom
      )
      
      setZoom(newZoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    setCanvas(newCanvas)

    // 返回清理函数
    return () => {
      newCanvas.dispose()
    }
  }, [canvas, width, height, zoom, setCanvas])

  // 防抖渲染
  const debouncedRender = debounce(() => {
    if (canvas) {
      canvas.renderAll()
    }
  }, 16)

  // 清理防抖
  useEffect(() => {
    return () => {
      debouncedRender.cancel()
    }
  }, [debouncedRender])

  return (
    <div className="w-full h-full flex items-center justify-center p-8 bg-gray-50">
      <div className="relative shadow-lg">
        {showGrid && canvas && <Grid canvas={canvas} />}
        {showGuides && canvas && <Guidelines canvas={canvas} />}
        <canvas ref={canvasRef} id="editor-canvas" />
        <div className="absolute bottom-2 right-2 text-sm text-gray-500">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  )
}