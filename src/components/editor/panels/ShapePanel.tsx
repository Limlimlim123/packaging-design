'use client'

import { useCallback } from 'react'
import { fabric } from 'fabric'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ColorPicker } from '@/components/ui/color-picker'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
    Square,
    Circle,
    Triangle,
    Hexagon,
    Star,
    Heart,
    MessageCircle,
    ArrowRight,
    Minus,
    CornerUpRight
} from 'lucide-react'

type ShapeType = 
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'hexagon'
    | 'star'
    | 'heart'
    | 'speech'
    | 'arrow'
    | 'line'
    | 'curve'

interface ShapePreset {
    id: ShapeType
    icon: React.ReactNode
    label: string
    create: (canvas: fabric.Canvas, options?: any) => void
}

export function ShapePanel() {
    const { 
        canvas,
        addHistoryEntry,
        currentColor,
        setCurrentColor,
        strokeWidth,
        setStrokeWidth
    } = useEditorStore()

    const shapes: ShapePreset[] = [
        {
            id: 'rectangle',
            icon: <Square className="h-8 w-8" />,
            label: '矩形',
            create: (canvas) => {
                const rect = new fabric.Rect({
                    left: 100,
                    top: 100,
                    width: 100,
                    height: 100,
                    fill: currentColor,
                    strokeWidth,
                    stroke: '#000000'
                })
                canvas.add(rect)
                canvas.setActiveObject(rect)
            }
        },
        {
            id: 'circle',
            icon: <Circle className="h-8 w-8" />,
            label: '圆形',
            create: (canvas) => {
                const circle = new fabric.Circle({
                    left: 100,
                    top: 100,
                    radius: 50,
                    fill: currentColor,
                    strokeWidth,
                    stroke: '#000000'
                })
                canvas.add(circle)
                canvas.setActiveObject(circle)
            }
        },
        // ... 其他形状定义
    ]

    const handleAddShape = useCallback((shape: ShapePreset) => {
        if (!canvas) return

        shape.create(canvas)
        canvas.renderAll()
        addHistoryEntry()
    }, [canvas, currentColor, strokeWidth])

    return (
        <div className="p-4 space-y-4">
            <Tabs defaultValue="basic">
                <TabsList className="w-full">
                    <TabsTrigger value="basic" className="flex-1">基础形状</TabsTrigger>
                    <TabsTrigger value="special" className="flex-1">特殊形状</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                    <ScrollArea className="h-[300px]">
                        <div className="grid grid-cols-3 gap-2">
                            {shapes.slice(0, 6).map((shape) => (
                                <Button
                                    key={shape.id}
                                    variant="outline"
                                    className="h-20 p-2 flex flex-col items-center justify-center"
                                    onClick={() => handleAddShape(shape)}
                                >
                                    {shape.icon}
                                    <span className="text-xs mt-1">{shape.label}</span>
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="special" className="space-y-4">
                    <ScrollArea className="h-[300px]">
                        <div className="grid grid-cols-3 gap-2">
                            {shapes.slice(6).map((shape) => (
                                <Button
                                    key={shape.id}
                                    variant="outline"
                                    className="h-20 p-2 flex flex-col items-center justify-center"
                                    onClick={() => handleAddShape(shape)}
                                >
                                    {shape.icon}
                                    <span className="text-xs mt-1">{shape.label}</span>
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>填充颜色</Label>
                    <ColorPicker
                        color={currentColor}
                        onChange={setCurrentColor}
                    />
                </div>

                <div className="space-y-2">
                    <Label>边框宽度</Label>
                    <Slider
                        value={[strokeWidth]}
                        onValueChange={([value]) => setStrokeWidth(value)}
                        min={0}
                        max={20}
                        step={1}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                        {strokeWidth}px
                    </div>
                </div>
            </div>
        </div>
    )
}