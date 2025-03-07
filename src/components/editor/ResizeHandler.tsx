'use client'

import { useEffect, useState } from 'react'
import { fabric } from 'fabric'
import { useToast } from '@/components/ui/use-toast'

interface ResizeHandlerProps {
  canvas: fabric.Canvas | null
}

export function ResizeHandler({ canvas }: ResizeHandlerProps) {
  const { toast } = useToast()
  const [scale, setScale] = useState(1)
  
  useEffect(() => {
    if (!canvas) return

    // 触控缩放处理
    canvas.on('touch:gesture', function(event: any) {
      if (event.scale) {
        const obj = canvas.getActiveObject()
        if (!obj) return

        const newScale = obj.scaleX! * event.scale
        // 限制缩放范围
        if (newScale > 0.2 && newScale < 5) {
          obj.scale(newScale)
          canvas.renderAll()
          setScale(newScale)
        }
      }
    })

    // 鼠标拖拽处理
    canvas.on('object:scaling', function(event: any) {
      const obj = event.target
      if (!obj) return

      // 保持宽高比
      if (obj.type === 'image') {
        obj.scaleY = obj.scaleX
      }

      // 检查DPI
      if (obj.type === 'image' && obj._element) {
        const width = obj.width! * obj.scaleX!
        const height = obj.height! * obj.scaleY!
        const dpi = (obj._element.naturalWidth / width) * 72
        
        // DPI警告
        if (dpi < 300) {
          showDpiWarning()
        }
      }

      setScale(obj.scaleX!)
    })

    return () => {
      canvas.off('touch:gesture')
      canvas.off('object:scaling')
    }
  }, [canvas])

  // DPI警告提示
  const showDpiWarning = () => {
    toast({
      title: "图片质量警告",
      description: "当前分辨率低于300DPI，可能影响打印质量",
      variant: "warning"
    })
  }

  return null // 这是一个功能性组件，不需要渲染UI
}