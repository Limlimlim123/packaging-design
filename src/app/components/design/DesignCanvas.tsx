'use client'

import { useEffect, useRef } from 'react'
import type { Canvas } from 'fabric/fabric-impl'
import type { Object as FabricObject } from 'fabric/fabric-impl'
import { useEditorStore } from '@/store/editor/editorStore'
import { Guidelines } from '@/app/components/editor/Guidelines'
import { toast } from 'sonner'
import { DesignGrid } from './DesignGrid'

// 获取全局 fabric 实例
declare const fabric: any

// 定义 Fabric.js 事件类型
interface FabricEvent<T = any> {
  e: T
  target?: any
  subTargets?: any[]
  button?: number
  isClick?: boolean
  pointer?: { x: number; y: number }
  absolutePointer?: { x: number; y: number }
  transform?: any
}

// 定义可克隆对象类型
interface CloneableObject extends FabricObject {
  clone(callback: (cloned: FabricObject) => void): void
  set(options: Record<string, any>): this
  type?: string
  left?: number
  top?: number
}

interface DesignCanvasProps {
  width: number
  height: number
  backgroundColor?: string
  onReady?: (canvas: Canvas) => void
}

export function DesignCanvas({
  width,
  height,
  backgroundColor = '#ffffff',
  onReady
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editorStore = useEditorStore()

  useEffect(() => {
    if (!canvasRef.current) return

    // 初始化画布
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      stopContextMenu: true
    })

    // 设置画布缩放限制
    fabricCanvas.on('mouse:wheel', (opt: FabricEvent<WheelEvent>) => {
      const delta = opt.e.deltaY
      let newZoom = fabricCanvas.getZoom() - delta / 1000
      newZoom = Math.min(Math.max(0.1, newZoom), 3)
      
      const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY)
      
      fabricCanvas.zoomToPoint(point, newZoom)
      editorStore.setZoom(newZoom)
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })

    // 处理键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) {
              editorStore.redo()
            } else {
              editorStore.undo()
            }
            e.preventDefault()
            break
          case 'c':
            // Ctrl/Cmd + C: Copy
            const activeObject = fabricCanvas.getActiveObject() as CloneableObject
            if (activeObject) {
              activeObject.clone((cloned: FabricObject) => {
                editorStore.setCopiedObject(cloned)
                toast('已复制对象')
              })
            }
            e.preventDefault()
            break
          case 'v':
            // Ctrl/Cmd + V: Paste
            const copiedObject = editorStore.copiedObject as CloneableObject
            if (copiedObject) {
              copiedObject.clone((cloned: FabricObject) => {
                cloned.set({
                  left: (cloned.left || 0) + 20,
                  top: (cloned.top || 0) + 20,
                  evented: true,
                })
                fabricCanvas.add(cloned)
                fabricCanvas.setActiveObject(cloned)
                fabricCanvas.renderAll()
                editorStore.addToHistory({
                  type: 'paste',
                  description: '粘贴对象'
                })
                toast('已粘贴对象')
              })
            }
            e.preventDefault()
            break
          case 'a':
            // Ctrl/Cmd + A: Select All
            fabricCanvas.discardActiveObject()
            const sel = new fabric.ActiveSelection(fabricCanvas.getObjects(), {
              canvas: fabricCanvas
            })
            fabricCanvas.setActiveObject(sel)
            fabricCanvas.renderAll()
            e.preventDefault()
            break
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Delete: Remove selected object
        const activeObject = fabricCanvas.getActiveObject()
        if (activeObject) {
          fabricCanvas.remove(activeObject)
          fabricCanvas.renderAll()
          editorStore.addToHistory({
            type: 'delete',
            description: '删除对象'
          })
          toast('已删除对象')
        }
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // 监听对象修改，记录历史
    fabricCanvas.on('object:modified', (e: FabricEvent) => {
      const target = e.target
      editorStore.addToHistory({
        type: 'modify',
        description: `修改${target?.type || ''}对象`
      })
    })

    // 监听对象添加
    fabricCanvas.on('object:added', (e: FabricEvent) => {
      const target = e.target
      if (!target.__addedByHistory) { // 避免历史记录恢复时重复添加
        editorStore.addToHistory({
          type: 'add',
          description: `添加${target?.type || ''}对象`
        })
      }
    })

    // 监听选择变化
    fabricCanvas.on('selection:created', (e: FabricEvent) => {
      const activeObject = e.target
      editorStore.setActiveObject(activeObject)
      if (activeObject) {
        toast(`已选择 ${activeObject.type || ''} 对象`)
      }
    })

    fabricCanvas.on('selection:cleared', () => {
      editorStore.setActiveObject(null)
    })

    // 监听对象移动
    fabricCanvas.on('object:moving', (e: FabricEvent) => {
      const target = e.target
      if (target && editorStore.showGuides) {
        // 在这里可以添加对齐辅助线的逻辑
      }
    })

    // 设置画布实例
    editorStore.setCanvas(fabricCanvas)
    if (onReady) onReady(fabricCanvas)

    // 添加初始历史记录
    editorStore.addToHistory({
      type: 'initialize',
      description: '初始化画布'
    })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      fabricCanvas.dispose()
    }
  }, [width, height, backgroundColor, onReady, editorStore])

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      <canvas ref={canvasRef} />
      {editorStore.showGrid && <DesignGrid width={width} height={height} />}
      {editorStore.showGuides && editorStore.canvas && (
        <Guidelines canvas={editorStore.canvas} />
      )}
    </div>
  )
}