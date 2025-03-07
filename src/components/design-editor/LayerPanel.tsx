'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Canvas } from 'fabric'
import { 
    Layers,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Trash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface LayerPanelProps {
    canvas: Canvas | null
    onLayerUpdate: () => void
}

interface Layer {
    id: string
    name: string
    type: string
    visible: boolean
    locked: boolean
    object: fabric.Object
}

export default function LayerPanel({ canvas, onLayerUpdate }: LayerPanelProps) {
    const [layers, setLayers] = useState<Layer[]>([])
    const [selectedLayer, setSelectedLayer] = useState<string | null>(null)

    // 更新图层列表
    const updateLayers = useCallback(() => {
        if (!canvas) return

        const objects = canvas.getObjects()
        const newLayers = objects.map((obj) => ({
            id: obj.id as string || Math.random().toString(36).substr(2, 9),
            name: getLayerName(obj),
            type: obj.type || 'unknown',
            visible: obj.visible ?? true,
            locked: obj.lockMovementX && obj.lockMovementY,
            object: obj
        }))

        setLayers(newLayers.reverse())
    }, [canvas])

    // 获取图层名称
    const getLayerName = (obj: fabric.Object): string => {
        if (obj.type === 'i-text') {
            return (obj as fabric.IText).text || '文本'
        }
        if (obj.type === 'image') return '图片'
        return obj.type || '未知图层'
    }

    // 监听画布变化
    useEffect(() => {
        if (!canvas) return

        const events = [
            'object:added',
            'object:removed',
            'object:modified',
            'selection:created',
            'selection:updated',
            'selection:cleared'
        ]

        const handleCanvasUpdate = () => {
            updateLayers()
            const activeObject = canvas.getActiveObject()
            setSelectedLayer(activeObject?.id as string || null)
        }

        events.forEach(event => {
            canvas.on(event, handleCanvasUpdate)
        })

        updateLayers()

        return () => {
            events.forEach(event => {
                canvas.off(event, handleCanvasUpdate)
            })
        }
    }, [canvas, updateLayers])

    // 图层操作
    const handleLayerOperation = useCallback((
        operation: 'visibility' | 'lock' | 'move' | 'delete',
        layer: Layer,
        direction?: 'up' | 'down'
    ) => {
        if (!canvas) return

        switch (operation) {
            case 'visibility':
                layer.object.set('visible', !layer.visible)
                break
            case 'lock':
                const isLocked = !layer.locked
                layer.object.set({
                    lockMovementX: isLocked,
                    lockMovementY: isLocked,
                    lockRotation: isLocked,
                    lockScalingX: isLocked,
                    lockScalingY: isLocked,
                    selectable: !isLocked,
                    evented: !isLocked,
                })
                break
            case 'move':
                if (!direction) return
                const currentIndex = canvas.getObjects().indexOf(layer.object)
                const newIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1
                if (newIndex < 0 || newIndex >= canvas.getObjects().length) return
                canvas.moveTo(layer.object, newIndex)
                break
            case 'delete':
                canvas.remove(layer.object)
                break
        }

        canvas.renderAll()
        updateLayers()
        onLayerUpdate()
    }, [canvas, updateLayers, onLayerUpdate])

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    <span>图层面板</span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {layers.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">
                        暂无图层
                    </div>
                ) : (
                    layers.map((layer) => (
                        <div
                            key={layer.id}
                            className={cn(
                                'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                                selectedLayer === layer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200',
                                layer.locked ? 'opacity-50' : 'hover:bg-gray-50'
                            )}
                            onClick={() => {
                                if (!canvas || layer.locked) return
                                canvas.setActiveObject(layer.object)
                                canvas.renderAll()
                                setSelectedLayer(layer.id)
                            }}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">
                                        {layer.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {layer.type}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleLayerOperation('visibility', layer)
                                    }}
                                >
                                    {layer.visible ? (
                                        <Eye className="h-4 w-4" />
                                    ) : (
                                        <EyeOff className="h-4 w-4" />
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleLayerOperation('lock', layer)
                                    }}
                                >
                                    {layer.locked ? (
                                        <Lock className="h-4 w-4" />
                                    ) : (
                                        <Unlock className="h-4 w-4" />
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleLayerOperation('move', layer, 'up')
                                    }}
                                    disabled={layers.indexOf(layer) === 0}
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleLayerOperation('move', layer, 'down')
                                    }}
                                    disabled={layers.indexOf(layer) === layers.length - 1}
                                >
                                    <ArrowDown className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleLayerOperation('delete', layer)
                                    }}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}