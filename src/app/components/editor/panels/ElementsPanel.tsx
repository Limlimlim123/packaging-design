'use client'

import { useEditorStore } from '@/store/editor/editorStore'
import { fabric } from 'fabric'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  Square, 
  Circle, 
  Triangle,
  Heart,
  Star,
  Hexagon,
  MessageCircle,
  ArrowRight
} from 'lucide-react'

const SHAPES = [
  {
    name: '矩形',
    icon: Square,
    create: (canvas: fabric.Canvas) => {
      return new fabric.Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: '#4CAF50',
        strokeWidth: 0
      })
    }
  },
  {
    name: '圆形',
    icon: Circle,
    create: (canvas: fabric.Canvas) => {
      return new fabric.Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: '#2196F3',
        strokeWidth: 0
      })
    }
  },
  {
    name: '三角形',
    icon: Triangle,
    create: (canvas: fabric.Canvas) => {
      return new fabric.Triangle({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: '#FFC107',
        strokeWidth: 0
      })
    }
  },
  {
    name: '心形',
    icon: Heart,
    create: (canvas: fabric.Canvas) => {
      const path = 'M 272.70141,238.71731 C 206.46141,238.71731 152.70146,292.4773 152.70146,358.71731 C 152.70146,493.47282 272.70141,528.71731 272.70141,528.71731 C 272.70141,528.71731 392.70141,493.47282 392.70141,358.71731 C 392.70141,292.4773 338.94141,238.71731 272.70141,238.71731 z'
      return new fabric.Path(path, {
        left: 100,
        top: 100,
        fill: '#E91E63',
        strokeWidth: 0,
        scaleX: 0.2,
        scaleY: 0.2
      })
    }
  },
  {
    name: '星形',
    icon: Star,
    create: (canvas: fabric.Canvas) => {
      return new fabric.Path('M 100 10 L 120 90 L 200 90 L 135 140 L 155 220 L 100 170 L 45 220 L 65 140 L 0 90 L 80 90 Z', {
        left: 100,
        top: 100,
        fill: '#9C27B0',
        strokeWidth: 0,
        scaleX: 0.5,
        scaleY: 0.5
      })
    }
  },
  {
    name: '对话框',
    icon: MessageCircle,
    create: (canvas: fabric.Canvas) => {
      return new fabric.Path('M 10 10 H 90 V 70 Q 90 80 80 80 H 40 L 20 100 L 20 80 H 10 Q 0 80 0 70 V 20 Q 0 10 10 10 Z', {
        left: 100,
        top: 100,
        fill: '#FF5722',
        strokeWidth: 0,
        scaleX: 2,
        scaleY: 2
      })
    }
  },
  {
    name: '箭头',
    icon: ArrowRight,
    create: (canvas: fabric.Canvas) => {
      return new fabric.Path('M 0 20 H 80 L 80 0 L 120 40 L 80 80 L 80 60 H 0 Z', {
        left: 100,
        top: 100,
        fill: '#795548',
        strokeWidth: 0
      })
    }
  },
  {
    name: '六边形',
    icon: Hexagon,
    create: (canvas: fabric.Canvas) => {
      return new fabric.Path('M 50 0 L 100 25 L 100 75 L 50 100 L 0 75 L 0 25 Z', {
        left: 100,
        top: 100,
        fill: '#607D8B',
        strokeWidth: 0
      })
    }
  }
]

export function ElementsPanel() {
  const { canvas, addToHistory } = useEditorStore()
  const { toast } = useToast()

  const handleAddShape = (shape: typeof SHAPES[0]) => {
    if (!canvas) return

    try {
      const object = shape.create(canvas)
      canvas.add(object)
      canvas.setActiveObject(object)
      addToHistory()
      canvas.renderAll()
      
      toast({
        description: `已添加${shape.name}`
      })
    } catch (error) {
      console.error('添加形状失败:', error)
      toast({
        title: "添加失败",
        description: "无法添加形状，请重试",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      {SHAPES.map((shape) => (
        <Button
          key={shape.name}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center"
          onClick={() => handleAddShape(shape)}
        >
          <shape.icon className="w-8 h-8 mb-1" />
          <span className="text-xs">{shape.name}</span>
        </Button>
      ))}
    </div>
  )
}