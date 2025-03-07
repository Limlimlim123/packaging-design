'use client'

import { useRef, useEffect } from 'react'
import type { fabric } from 'fabric'  // 改为类型导入
import { useEditorStore } from '@/store/editor/editorStore'

// 声明全局 fabric 变量
declare const fabric: any

interface PreviewCanvasProps {
  width: number
  height: number
  className?: string
  onReady?: (canvas: fabric.Canvas) => void
}

export function PreviewCanvas({ 
  width, 
  height, 
  className,
  onReady 
}: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const { setCanvas } = useEditorStore()

  useEffect(() => {
    if (!canvasRef.current) return

    // 初始化 Fabric.js 画布
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      renderOnAddRemove: false,
      selection: true, // 允许多选
      interactive: true, // 允许交互
      stateful: false // 禁用状态跟踪以提高性能
    })

    // 设置画布默认属性
    canvas.setZoom(1)
    canvas.centeredScaling = true
    canvas.uniformScaling = true

    // 配置选中样式
    canvas.selectionColor = 'rgba(0, 123, 255, 0.1)'
    canvas.selectionBorderColor = '#007bff'
    canvas.selectionLineWidth = 1

    // 性能优化：限制渲染频率
    let renderTimeout: NodeJS.Timeout
    canvas.on('object:moving', () => {
      clearTimeout(renderTimeout)
      renderTimeout = setTimeout(() => {
        canvas.renderAll()
      }, 10)
    })

    // 设置画布参考
    fabricRef.current = canvas
    setCanvas(canvas)
    
    // 通知父组件画布已准备就绪
    onReady?.(canvas)

    // 清理函数
    return () => {
      clearTimeout(renderTimeout)
      canvas.dispose()
      setCanvas(null)
    }
  }, [width, height, setCanvas, onReady])  // 添加缺失的依赖项

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (!fabricRef.current) return

      const canvas = fabricRef.current
      const container = canvas.wrapperEl?.parentElement
      if (!container) return

      // 计算新的尺寸
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const scale = Math.min(
        containerWidth / width,
        containerHeight / height
      )

      // 更新画布尺寸
      canvas.setDimensions({
        width: width * scale,
        height: height * scale
      })

      // 更新缩放
      canvas.setZoom(scale)
      canvas.renderAll()
    }

    window.addEventListener('resize', handleResize)
    handleResize() // 初始化时调用一次

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [width, height])

  return (
    <div className={className}>
      <canvas ref={canvasRef} />
    </div>
  )
}