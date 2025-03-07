'use client'

import { useEffect, useState } from 'react'
import { fabric } from 'fabric'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/ui/color-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Lock,
  Unlock,
  Copy,
  Trash2,
  MoveHorizontal,
  MoveVertical,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignEndVertical,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

// 字体选项
const fontFamilies = [
  { label: '思源黑体', value: 'Source Han Sans CN' },
  { label: '思源宋体', value: 'Source Han Serif CN' },
  { label: '阿里巴巴普惠体', value: 'Alibaba PuHuiTi' },
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '宋体', value: 'SimSun' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' }
]

interface PropertyPanelProps {
  canvas: fabric.Canvas | null
  isReady?: boolean
}

export function PropertyPanel({ canvas, isReady = true }: PropertyPanelProps) {
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null)
  const [objectType, setObjectType] = useState<string>('')
  const [isLocked, setIsLocked] = useState(false)
  const [opacity, setOpacity] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const [textProps, setTextProps] = useState({
    fontFamily: 'Source Han Sans CN',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    underline: false,
    lineHeight: 1.2,
    charSpacing: 0,
    textAlign: 'left',
    fill: '#000000'
  })

  // 监听选中对象变化
  useEffect(() => {
    if (!canvas || !isReady) return

    const updateSelection = () => {
      const selected = canvas.getActiveObject()
      setActiveObject(selected)
      setObjectType(selected?.type || '')
      setIsLocked(selected?.lockMovementX || false)
      setOpacity(selected?.opacity ? selected.opacity * 100 : 100)
      setRotation(selected?.angle || 0)
      setScale({
        x: selected?.scaleX || 1,
        y: selected?.scaleY || 1
      })

      // 更新文本属性
      if (selected instanceof fabric.Text) {
        setTextProps({
          fontFamily: selected.fontFamily || 'Source Han Sans CN',
          fontSize: selected.fontSize || 24,
          fontWeight: selected.fontWeight || 'normal',
          fontStyle: selected.fontStyle || 'normal',
          underline: selected.underline || false,
          lineHeight: selected.lineHeight || 1.2,
          charSpacing: selected.charSpacing || 0,
          textAlign: selected.textAlign || 'left',
          fill: selected.fill?.toString() || '#000000'
        })
      }
    }

    canvas.on('selection:created', updateSelection)
    canvas.on('selection:updated', updateSelection)
    canvas.on('selection:cleared', updateSelection)
    canvas.on('object:modified', updateSelection)

    return () => {
      canvas.off('selection:created', updateSelection)
      canvas.off('selection:updated', updateSelection)
      canvas.off('selection:cleared', updateSelection)
      canvas.off('object:modified', updateSelection)
    }
  }, [canvas, isReady])

  // 对象锁定/解锁
  const toggleLock = () => {
    if (!activeObject) return
    const locked = !isLocked
    activeObject.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockRotation: locked,
      lockScalingX: locked,
      lockScalingY: locked
    })
    setIsLocked(locked)
    canvas?.renderAll()
  }

  // 图层操作
  const handleLayer = (action: 'forward' | 'backward') => {
    if (!activeObject || !canvas) return
    
    if (action === 'forward') {
      activeObject.bringForward()
    } else {
      activeObject.sendBackward()
    }
    canvas.renderAll()
  }

  // 翻转操作
  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (!activeObject) return
    
    if (direction === 'horizontal') {
      activeObject.set('flipX', !activeObject.flipX)
    } else {
      activeObject.set('flipY', !activeObject.flipY)
    }
    canvas?.renderAll()
  }

  // 对齐操作
  const alignObject = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!canvas || !activeObject) return

    const bounds = canvas.getWidth()
    const height = canvas.getHeight()
    const obj = activeObject

    switch (direction) {
      case 'left':
        obj.set('left', obj.getScaledWidth() / 2)
        break
      case 'center':
        obj.set('left', bounds / 2)
        break
      case 'right':
        obj.set('left', bounds - obj.getScaledWidth() / 2)
        break
      case 'top':
        obj.set('top', obj.getScaledHeight() / 2)
        break
      case 'middle':
        obj.set('top', height / 2)
        break
      case 'bottom':
        obj.set('top', height - obj.getScaledHeight() / 2)
        break
    }

    canvas.renderAll()
  }

  // 分布操作
  const distributeObjects = (direction: 'horizontal' | 'vertical') => {
    if (!canvas) return

    const objects = canvas.getActiveObjects()
    if (objects.length < 3) return

    objects.sort((a, b) => {
      return direction === 'horizontal' 
        ? (a.left || 0) - (b.left || 0)
        : (a.top || 0) - (b.top || 0)
    })

    const first = objects[0]
    const last = objects[objects.length - 1]
    const totalSpace = direction === 'horizontal'
      ? (last.left || 0) - (first.left || 0)
      : (last.top || 0) - (first.top || 0)

    const spacing = totalSpace / (objects.length - 1)

    objects.forEach((obj, index) => {
      if (index === 0 || index === objects.length - 1) return

      if (direction === 'horizontal') {
        obj.set('left', (first.left || 0) + spacing * index)
      } else {
        obj.set('top', (first.top || 0) + spacing * index)
      }
    })

    canvas.renderAll()
  }

    // 样式内容
    const styleContent = (
        <TabsContent value="style" className="space-y-4 p-4">
          <div>
            <Label>不透明度</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[opacity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => {
                  setOpacity(value)
                  activeObject?.set('opacity', value / 100)
                  canvas?.renderAll()
                }}
              />
              <span className="w-12 text-sm text-gray-500">{opacity}%</span>
            </div>
          </div>
    
          <div>
            <Label>旋转</Label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={([value]) => {
                  setRotation(value)
                  activeObject?.set('angle', value)
                  canvas?.renderAll()
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setRotation(r => (r + 90) % 360)
                  activeObject?.rotate((rotation + 90) % 360)
                  canvas?.renderAll()
                }}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
    
          <div className="space-y-2">
            <Label>变换</Label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleFlip('horizontal')}
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleFlip('vertical')}
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleLock}
              >
                {isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
    
          <div className="space-y-2">
            <Label>图层</Label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleLayer('forward')}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleLayer('backward')}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      )
    
      // 位置内容
      const positionContent = (
        <TabsContent value="position" className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>X 坐标</Label>
              <Input
                type="number"
                value={Math.round(activeObject?.left || 0)}
                onChange={(e) => {
                  activeObject?.set('left', Number(e.target.value))
                  canvas?.renderAll()
                }}
              />
            </div>
            <div>
              <Label>Y 坐标</Label>
              <Input
                type="number"
                value={Math.round(activeObject?.top || 0)}
                onChange={(e) => {
                  activeObject?.set('top', Number(e.target.value))
                  canvas?.renderAll()
                }}
              />
            </div>
            <div>
              <Label>宽度</Label>
              <Input
                type="number"
                value={Math.round((activeObject?.width || 0) * (scale.x || 1))}
                onChange={(e) => {
                  const width = Number(e.target.value)
                  const scaleX = width / (activeObject?.width || 1)
                  activeObject?.scale(scaleX)
                  setScale(s => ({ ...s, x: scaleX }))
                  canvas?.renderAll()
                }}
              />
            </div>
            <div>
              <Label>高度</Label>
              <Input
                type="number"
                value={Math.round((activeObject?.height || 0) * (scale.y || 1))}
                onChange={(e) => {
                  const height = Number(e.target.value)
                  const scaleY = height / (activeObject?.height || 1)
                  activeObject?.scale(scaleY)
                  setScale(s => ({ ...s, y: scaleY }))
                  canvas?.renderAll()
                }}
              />
            </div>
          </div>
        </TabsContent>
      )
    
      // 对齐内容
      const alignmentContent = (
        <div className="space-y-4 p-4">
          <Label>水平对齐</Label>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => alignObject('left')}
            >
              <AlignStartHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => alignObject('center')}
            >
              <MoveHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => alignObject('right')}
            >
              <AlignEndHorizontal className="h-4 w-4" />
            </Button>
          </div>
    
          <Label>垂直对齐</Label>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => alignObject('top')}
            >
              <AlignStartVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => alignObject('middle')}
            >
              <MoveVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => alignObject('bottom')}
            >
              <AlignEndVertical className="h-4 w-4" />
            </Button>
          </div>
    
          <Label>分布</Label>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => distributeObjects('horizontal')}
            >
              水平分布
            </Button>
            <Button
              variant="outline"
              onClick={() => distributeObjects('vertical')}
            >
              垂直分布
            </Button>
          </div>
        </div>
      )
    
      // 文本内容
      const textContent = activeObject instanceof fabric.Text && (
        <TabsContent value="text" className="space-y-4 p-4">
          <div>
            <Label>字体</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3"
              value={textProps.fontFamily}
              onChange={(e) => {
                const value = e.target.value
                setTextProps(prev => ({ ...prev, fontFamily: value }))
                activeObject.set('fontFamily', value)
                canvas?.renderAll()
              }}
            >
              {fontFamilies.map(font => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
    
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>字号</Label>
              <Input
                type="number"
                value={textProps.fontSize}
                min={1}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setTextProps(prev => ({ ...prev, fontSize: value }))
                  activeObject.set('fontSize', value)
                  canvas?.renderAll()
                }}
              />
            </div>
            <div>
              <Label>行高</Label>
              <Input
                type="number"
                value={textProps.lineHeight}
                min={0.1}
                step={0.1}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  setTextProps(prev => ({ ...prev, lineHeight: value }))
                  activeObject.set('lineHeight', value)
                  canvas?.renderAll()
                }}
              />
            </div>
          </div>
    
          <div>
            <Label>字体样式</Label>
            <div className="flex space-x-2">
              <Button
                variant={textProps.fontWeight === 'bold' ? 'default' : 'outline'}
                size="icon"
                onClick={() => {
                  const newWeight = textProps.fontWeight === 'bold' ? 'normal' : 'bold'
                  setTextProps(prev => ({ ...prev, fontWeight: newWeight }))
                  activeObject.set('fontWeight', newWeight)
                  canvas?.renderAll()
                }}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={textProps.fontStyle === 'italic' ? 'default' : 'outline'}
                size="icon"
                onClick={() => {
                  const newStyle = textProps.fontStyle === 'italic' ? 'normal' : 'italic'
                  setTextProps(prev => ({ ...prev, fontStyle: newStyle }))
                  activeObject.set('fontStyle', newStyle)
                  canvas?.renderAll()
                }}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant={textProps.underline ? 'default' : 'outline'}
                size="icon"
                onClick={() => {
                  const newUnderline = !textProps.underline
                  setTextProps(prev => ({ ...prev, underline: newUnderline }))
                  activeObject.set('underline', newUnderline)
                  canvas?.renderAll()
                }}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </div>
          </div>
    
          <div>
            <Label>对齐方式</Label>
            <div className="flex space-x-2">
              <Button
                variant={textProps.textAlign === 'left' ? 'default' : 'outline'}
                size="icon"
                onClick={() => {
                  setTextProps(prev => ({ ...prev, textAlign: 'left' }))
                  activeObject.set('textAlign', 'left')
                  canvas?.renderAll()
                }}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={textProps.textAlign === 'center' ? 'default' : 'outline'}
                size="icon"
                onClick={() => {
                  setTextProps(prev => ({ ...prev, textAlign: 'center' }))
                  activeObject.set('textAlign', 'center')
                  canvas?.renderAll()
                }}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={textProps.textAlign === 'right' ? 'default' : 'outline'}
                size="icon"
                onClick={() => {
                  setTextProps(prev => ({ ...prev, textAlign: 'right' }))
                  activeObject.set('textAlign', 'right')
                  canvas?.renderAll()
                }}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
    
          <div>
            <Label>字间距</Label>
            <Slider
              value={[textProps.charSpacing]}
              min={-20}
              max={100}
              step={1}
              onValueChange={([value]) => {
                setTextProps(prev => ({ ...prev, charSpacing: value }))
                activeObject.set('charSpacing', value)
                canvas?.renderAll()
              }}
            />
          </div>
    
          <div>
            <Label>文字颜色</Label>
            <ColorPicker
              color={textProps.fill}
              onChange={(color) => {
                setTextProps(prev => ({ ...prev, fill: color }))
                activeObject.set('fill', color)
                canvas?.renderAll()
              }}
            />
          </div>
        </TabsContent>
      )
    
      return (
        <div className="w-64 border-l bg-white">
          {!activeObject ? (
            <div className="p-4 text-center text-gray-500">
              选择对象以编辑属性
            </div>
          ) : (
            <Tabs defaultValue="style">
              <TabsList className="w-full">
                <TabsTrigger value="style" className="flex-1">样式</TabsTrigger>
                <TabsTrigger value="position" className="flex-1">位置</TabsTrigger>
                <TabsTrigger value="align" className="flex-1">对齐</TabsTrigger>
                {activeObject instanceof fabric.Text && (
                  <TabsTrigger value="text" className="flex-1">文字</TabsTrigger>
                )}
              </TabsList>
    
              {styleContent}
              {positionContent}
              <TabsContent value="align" className="space-y-4">
                {alignmentContent}
              </TabsContent>
              {textContent}
            </Tabs>
          )}
        </div>
      )
    }