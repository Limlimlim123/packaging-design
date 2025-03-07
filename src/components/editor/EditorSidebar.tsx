'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/ui/color-picker'
import { useEditorStore } from '@/store/editor/editorStore'
import { FileUpload } from '@/components/upload/FileUpload'
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Palette,
  Move,
  RotateCw,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react'

interface ObjectControls {
  position: boolean
  size: boolean
  rotation: boolean
  opacity: boolean
  text?: boolean
  fill?: boolean
}

export default function EditorSidebar() {
  const { canvas, addToHistory } = useEditorStore()
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null)
  const [controls, setControls] = useState<ObjectControls>({
    position: true,
    size: true,
    rotation: true,
    opacity: true
  })

  // 监听画布选择变化
  useEffect(() => {
    if (!canvas) return

    const handleSelection = (e: fabric.IEvent) => {
      const target = e.target as fabric.Object
      setActiveObject(target)
      
      // 更新控制项显示
      if (target) {
        setControls({
          position: true,
          size: true,
          rotation: true,
          opacity: true,
          text: target.type === 'text',
          fill: true
        })
      }
    }

    canvas.on({
      'selection:created': handleSelection,
      'selection:updated': handleSelection,
      'selection:cleared': () => {
        setActiveObject(null)
        setControls({
          position: true,
          size: true,
          rotation: true,
          opacity: true
        })
      }
    })

    return () => {
      canvas.off({
        'selection:created': handleSelection,
        'selection:updated': handleSelection,
        'selection:cleared': () => setActiveObject(null)
      })
    }
  }, [canvas])

  const handleImageUpload = async (file: File) => {
    if (!canvas || !file) return
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        fabric.Image.fromURL(e.target?.result as string, (img) => {
          img.scaleToWidth(200)
          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
          addToHistory()
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('图片上传失败:', error)
    }
  }

  const updateObjectProperty = (property: string, value: any) => {
    if (!activeObject || !canvas) return
    
    const originalValue = activeObject.get(property)
    if (originalValue === value) return

    activeObject.set(property, value)
    canvas.renderAll()
    addToHistory()
  }

  const deleteActiveObject = () => {
    if (!activeObject || !canvas) return
    canvas.remove(activeObject)
    canvas.renderAll()
    addToHistory()
  }

  const toggleLock = () => {
    if (!activeObject || !canvas) return
    activeObject.set('lockMovementX', !activeObject.lockMovementX)
    activeObject.set('lockMovementY', !activeObject.lockMovementY)
    canvas.renderAll()
    addToHistory()
  }

  const toggleVisibility = () => {
    if (!activeObject || !canvas) return
    activeObject.set('visible', !activeObject.visible)
    canvas.renderAll()
    addToHistory()
  }

  return (
    <div className="w-64 h-full bg-white border-l">
      <Tabs defaultValue="add" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">添加</TabsTrigger>
          <TabsTrigger value="edit">编辑</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="flex-1 p-4 space-y-4">
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                if (!canvas) return
                const text = new fabric.IText('双击编辑文本', {
                  left: 100,
                  top: 100,
                  fontSize: 20
                })
                canvas.add(text)
                canvas.setActiveObject(text)
                canvas.renderAll()
                addToHistory()
              }}
            >
              <Type className="h-4 w-4 mr-2" />
              添加文本
            </Button>

            <FileUpload
              onUpload={handleImageUpload}
              accept="image/*"
              className="w-full"
            >
              <Button variant="outline" className="w-full justify-start">
                <ImageIcon className="h-4 w-4 mr-2" />
                上传图片
              </Button>
            </FileUpload>
          </div>

          <div className="space-y-2">
            <Label>基础形状</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!canvas) return
                  const rect = new fabric.Rect({
                    left: 100,
                    top: 100,
                    width: 100,
                    height: 100,
                    fill: '#cccccc'
                  })
                  canvas.add(rect)
                  canvas.setActiveObject(rect)
                  canvas.renderAll()
                  addToHistory()
                }}
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!canvas) return
                  const circle = new fabric.Circle({
                    left: 100,
                    top: 100,
                    radius: 50,
                    fill: '#cccccc'
                  })
                  canvas.add(circle)
                  canvas.setActiveObject(circle)
                  canvas.renderAll()
                  addToHistory()
                }}
              >
                <Circle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!canvas) return
                  const triangle = new fabric.Triangle({
                    left: 100,
                    top: 100,
                    width: 100,
                    height: 100,
                    fill: '#cccccc'
                  })
                  canvas.add(triangle)
                  canvas.setActiveObject(triangle)
                  canvas.renderAll()
                  addToHistory()
                }}
              >
                <Triangle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="flex-1 p-4 space-y-4">
          {activeObject ? (
            <>
              <div className="flex justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLock}
                  title={activeObject.lockMovementX ? '解锁' : '锁定'}
                >
                  {activeObject.lockMovementX ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleVisibility}
                  title={activeObject.visible ? '隐藏' : '显示'}
                >
                  {activeObject.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={deleteActiveObject}
                  className="text-red-500 hover:text-red-600"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {controls.position && (
                <div className="space-y-2">
                  <Label>位置</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">X</Label>
                      <Input
                        type="number"
                        value={Math.round(activeObject.left || 0)}
                        onChange={(e) => updateObjectProperty('left', +e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Y</Label>
                      <Input
                        type="number"
                        value={Math.round(activeObject.top || 0)}
                        onChange={(e) => updateObjectProperty('top', +e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {controls.size && (
                <div className="space-y-2">
                  <Label>大小</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">宽度</Label>
                      <Input
                        type="number"
                        value={Math.round(activeObject.width! * (activeObject.scaleX || 1))}
                        onChange={(e) => {
                          const scale = +e.target.value / activeObject.width!
                          updateObjectProperty('scaleX', scale)
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">高度</Label>
                      <Input
                        type="number"
                        value={Math.round(activeObject.height! * (activeObject.scaleY || 1))}
                        onChange={(e) => {
                          const scale = +e.target.value / activeObject.height!
                          updateObjectProperty('scaleY', scale)
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {controls.rotation && (
                <div className="space-y-2">
                  <Label>旋转</Label>
                  <Slider
                    value={[activeObject.angle || 0]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={([value]) => updateObjectProperty('angle', value)}
                  />
                </div>
              )}

              {controls.opacity && (
                <div className="space-y-2">
                  <Label>不透明度</Label>
                  <Slider
                    value={[activeObject.opacity! * 100]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => updateObjectProperty('opacity', value / 100)}
                  />
                </div>
              )}

              {controls.text && activeObject.type === 'text' && (
                <div className="space-y-2">
                  <Label>文本样式</Label>
                  <ColorPicker
                    color={activeObject.fill as string}
                    onChange={(color) => updateObjectProperty('fill', color)}
                  />
                  <Input
                    type="number"
                    value={activeObject.fontSize}
                    onChange={(e) => updateObjectProperty('fontSize', +e.target.value)}
                    placeholder="字体大小"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              选择一个对象进行编辑
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 为了向后兼容，保留命名导出
export { EditorSidebar }