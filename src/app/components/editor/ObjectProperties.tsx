'use client'

import { useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { ColorPicker } from '@/components/ui/color-picker'
import type { Object as FabricObject, Text as FabricText } from 'fabric/fabric-impl'
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveHorizontal,
  MoveVertical,
  RotateCw,
  Trash2,
  Copy,
  Lock,
  Unlock
} from 'lucide-react'

// 声明全局 fabric 变量
declare const fabric: any

// 扩展 FabricObject 类型以包含 locked 属性
interface ExtendedFabricObject extends FabricObject {
  locked?: boolean
  lockMovementX?: boolean
  lockMovementY?: boolean
  lockRotation?: boolean
  lockScalingX?: boolean
  lockScalingY?: boolean
  hasControls?: boolean
  selectable?: boolean
}

interface ObjectProperties {
  fill: string
  opacity: number
  angle: number
  left: number
  top: number
  width: number
  height: number
  scaleX: number
  scaleY: number
  fontSize: number
  fontFamily: string
  textAlign: string
  fontWeight: string | number
  fontStyle: string
  underline: boolean
  locked: boolean
}

export function ObjectProperties() {
  const { canvas, activeObject } = useEditorStore()
  const [properties, setProperties] = useState<Partial<ObjectProperties>>({
    fill: '#000000',
    opacity: 1,
    angle: 0,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1
  })

  useEffect(() => {
    if (!activeObject) return

    const textObject = activeObject as FabricText
    const extendedObject = activeObject as ExtendedFabricObject

    setProperties({
      fill: activeObject.fill?.toString() || '#000000',
      opacity: activeObject.opacity || 1,
      angle: activeObject.angle || 0,
      left: activeObject.left || 0,
      top: activeObject.top || 0,
      width: activeObject.width || 0,
      height: activeObject.height || 0,
      scaleX: activeObject.scaleX || 1,
      scaleY: activeObject.scaleY || 1,
      fontSize: textObject.fontSize || 16,
      fontFamily: textObject.fontFamily || 'Arial',
      textAlign: textObject.textAlign || 'left',
      fontWeight: textObject.fontWeight || 'normal',
      fontStyle: textObject.fontStyle || 'normal',
      underline: textObject.underline || false,
      locked: extendedObject.locked || false
    })
  }, [activeObject])

  const updateObject = (updates: Partial<ObjectProperties>) => {
    if (!canvas || !activeObject) return

    activeObject.set(updates)
    canvas.renderAll()
    setProperties(prev => ({ ...prev, ...updates }))
  }

  const handleDuplicate = () => {
    if (!canvas || !activeObject) return

    activeObject.clone((cloned: FabricObject) => {
      cloned.set({
        left: cloned.left! + 10,
        top: cloned.top! + 10
      })
      canvas.add(cloned)
      canvas.setActiveObject(cloned)
      canvas.renderAll()
    })
  }

  const handleDelete = () => {
    if (!canvas || !activeObject) return

    canvas.remove(activeObject)
    canvas.renderAll()
  }

  const handleLock = () => {
    if (!activeObject) return
    
    const extendedObject = activeObject as ExtendedFabricObject
    const locked = !properties.locked
    updateObject({
      locked: locked,
    })
    
    extendedObject.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockRotation: locked,
      lockScalingX: locked,
      lockScalingY: locked,
      hasControls: !locked,
      selectable: !locked
    })
    
    canvas?.renderAll()
  }

  if (!activeObject) return null

  return (
    <div className="p-4 space-y-4">
      {/* 位置和大小 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>X 位置</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={Math.round(properties.left || 0)}
              onChange={e => updateObject({ left: Number(e.target.value) })}
            />
            <MoveHorizontal className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div>
          <Label>Y 位置</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={Math.round(properties.top || 0)}
              onChange={e => updateObject({ top: Number(e.target.value) })}
            />
            <MoveVertical className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <div>
          <Label>宽度</Label>
          <Input
            type="number"
            value={Math.round((properties.width || 0) * (properties.scaleX || 1))}
            onChange={e => {
              const newWidth = Number(e.target.value)
              updateObject({ scaleX: newWidth / (properties.width || 1) })
            }}
          />
        </div>
        <div>
          <Label>高度</Label>
          <Input
            type="number"
            value={Math.round((properties.height || 0) * (properties.scaleY || 1))}
            onChange={e => {
              const newHeight = Number(e.target.value)
              updateObject({ scaleY: newHeight / (properties.height || 1) })
            }}
          />
        </div>
        <div>
          <Label>旋转角度</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={Math.round(properties.angle || 0)}
              onChange={e => updateObject({ angle: Number(e.target.value) })}
            />
            <RotateCw className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* 颜色和透明度 */}
      <div>
        <Label>颜色</Label>
        <ColorPicker
          color={properties.fill || '#000000'}
          onChange={color => updateObject({ fill: color })}
        />
      </div>

      <div>
        <Label>不透明度</Label>
        <div className="flex items-center space-x-2">
          <Slider
            value={[(properties.opacity || 1) * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={(values) => {
              const value = values[0] ?? 100
              updateObject({ opacity: value / 100 })
            }}
          />
          <span className="w-12 text-right">{Math.round((properties.opacity || 1) * 100)}%</span>
        </div>
      </div>

      {/* 文本特有属性 */}
      {activeObject instanceof fabric.Text && (
        <div className="space-y-4">
          <div>
            <Label>字体大小</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[properties.fontSize || 16]}
                min={8}
                max={72}
                step={1}
                onValueChange={(values) => {
                  const value = values[0] ?? 16
                  updateObject({ fontSize: value })
                }}
              />
              <span className="w-12 text-right">{properties.fontSize || 16}px</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={properties.fontWeight === 'bold' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => updateObject({ 
                fontWeight: properties.fontWeight === 'bold' ? 'normal' : 'bold' 
              })}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant={properties.fontStyle === 'italic' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => updateObject({ 
                fontStyle: properties.fontStyle === 'italic' ? 'normal' : 'italic' 
              })}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant={properties.underline ? 'default' : 'ghost'}
              size="icon"
              onClick={() => updateObject({ underline: !properties.underline })}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={properties.textAlign === 'left' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => updateObject({ textAlign: 'left' })}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={properties.textAlign === 'center' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => updateObject({ textAlign: 'center' })}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={properties.textAlign === 'right' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => updateObject({ textAlign: 'right' })}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleLock}
          title={properties.locked ? "解锁" : "锁定"}
        >
          {properties.locked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <Unlock className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDuplicate}
          title="复制"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          title="删除"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}