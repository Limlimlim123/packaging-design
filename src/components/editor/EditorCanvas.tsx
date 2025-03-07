'use client'

import { useEffect, useRef } from 'react'
import { fabric } from 'fabric' // 修改这里
import { useEditorStore } from '@/store/editor/editorStore'

export default function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { setCanvas, showGrid, showGuides } = useEditorStore()

  useEffect(() => {
    if (!canvasRef.current) return

    // 使用 require 导入 fabric
    const fabric = require('fabric').fabric

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      defaultCursor: 'default',
      stopContextMenu: true
    })

    // 初始化画布
    setCanvas(canvas)

    // 添加网格
    if (showGrid) {
      const gridSize = 20
      for (let i = 0; i < canvas.width!; i += gridSize) {
        canvas.add(new fabric.Line([i, 0, i, canvas.height!], {
          stroke: '#ddd',
          selectable: false,
          evented: false
        }))
      }
      for (let i = 0; i < canvas.height!; i += gridSize) {
        canvas.add(new fabric.Line([0, i, canvas.width!, i], {
          stroke: '#ddd',
          selectable: false,
          evented: false
        }))
      }
    }

    // 添加参考线
    if (showGuides) {
      const centerX = canvas.width! / 2
      const centerY = canvas.height! / 2
      canvas.add(new fabric.Line([centerX, 0, centerX, canvas.height!], {
        stroke: '#0066ff',
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false
      }))
      canvas.add(new fabric.Line([0, centerY, canvas.width!, centerY], {
        stroke: '#0066ff',
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false
      }))
    }

    // 监听画布事件
    canvas.on('object:moving', (e) => {
      const obj = e.target
      if (!obj) return

      // 对齐辅助
      const snapTolerance = 10
      const objects = canvas.getObjects()
      
      objects.forEach((other) => {
        if (other === obj) return

        // 水平对齐
        if (Math.abs(obj.left! - other.left!) < snapTolerance) {
          obj.set('left', other.left)
        }
        if (Math.abs(obj.left! + obj.width! * obj.scaleX! - other.left!) < snapTolerance) {
          obj.set('left', other.left! - obj.width! * obj.scaleX!)
        }

        // 垂直对齐
        if (Math.abs(obj.top! - other.top!) < snapTolerance) {
          obj.set('top', other.top)
        }
        if (Math.abs(obj.top! + obj.height! * obj.scaleY! - other.top!) < snapTolerance) {
          obj.set('top', other.top! - obj.height! * obj.scaleY!)
        }
      })
    })

    // 清理函数
    return () => {
      canvas.dispose()
    }
  }, [setCanvas, showGrid, showGuides])

  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-auto">
      <div className="relative shadow-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

export { EditorCanvas }