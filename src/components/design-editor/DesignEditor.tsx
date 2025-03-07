'use client'

import { useEffect, useRef } from 'react'
import { fabric } from 'fabric' // 修改这里
import { useEditorStore } from '@/store/editor/editorStore'

interface DesignEditorProps {
  initialData?: string
  onChange?: (data: string) => void
}

export default function DesignEditor({ initialData, onChange }: DesignEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { setCanvas } = useEditorStore()

  useEffect(() => {
    if (!canvasRef.current) return

    // 使用 require 导入 fabric
    const fabric = require('fabric').fabric

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    })

    // 初始化画布
    setCanvas(canvas)

    // 加载初始数据
    if (initialData) {
      canvas.loadFromJSON(initialData, () => {
        canvas.renderAll()
      })
    }

    // 监听画布变化
    canvas.on('object:modified', () => {
      const json = canvas.toJSON()
      onChange?.(JSON.stringify(json))
    })

    return () => {
      canvas.dispose()
    }
  }, [initialData, onChange, setCanvas])

  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="relative shadow-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

export { DesignEditor }