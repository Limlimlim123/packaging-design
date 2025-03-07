'use client'

import { useCallback, useEffect, useState } from 'react'
import { Canvas } from 'fabric/fabric-impl'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
    Layers,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronRight,
    Copy,
    ArrowUp,
    ArrowDown,
    AlignCenter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from '@hello-pangea/dnd'

interface LayerPanelProps {
    canvas: Canvas | null
}

interface Layer {
    id: string
    name: string
    type: string
    visible: boolean
    locked: boolean
    selected: boolean
    hasChildren: boolean
    expanded?: boolean
    children?: Layer[]
    opacity?: number
    zIndex?: number // 新增：显示层级
}

export function LayerPanel({ canvas }: LayerPanelProps) {
    const [layers, setLayers] = useState<Layer[]>([])
    const { toast } = useToast()
    const [isDragging, setIsDragging] = useState(false)
    const [multiSelect, setMultiSelect] = useState(false) // 新增：多选状态

    // 更新图层列表
    const updateLayers = useCallback(() => {
        if (!canvas) return

        const objects = canvas.getObjects()
        const newLayers: Layer[] = objects.map((obj, index) => {
            const isGroup = obj.type === 'group'
            return {
                id: obj.data?.id || obj.id,
                name: obj.data?.name || getDefaultName(obj.type),
                type: obj.type,
                visible: !obj.invisible,
                locked: obj.locked || false,
                selected: canvas.getActiveObjects().includes(obj),
                hasChildren: isGroup,
                expanded: true,
                children: isGroup ? getGroupChildren(obj) : undefined,
                opacity: obj.opacity,
                zIndex: objects.length - index // 新增：计算层级
            }
        }).reverse()

        setLayers(newLayers)
    }, [canvas])

    // 监听画布事件
    useEffect(() => {
        if (!canvas) return

        const events = [
            'object:added',
            'object:removed',
            'object:modified',
            'selection:created',
            'selection:cleared',
            'selection:updated',
            'object:moving',
            'object:scaling',
            'object:rotating'
        ]

        events.forEach(event => {
            canvas.on(event, updateLayers)
        })

        // 新增：监听键盘事件
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setMultiSelect(true)
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setMultiSelect(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        updateLayers()

        return () => {
            events.forEach(event => {
                canvas.off(event, updateLayers)
            })
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [canvas, updateLayers])

    // 获取默认图层名称
    const getDefaultName = (type: string) => {
        switch (type) {
            case 'i-text':
            case 'textbox':
                return '文本'
            case 'image':
                return '图片'
            case 'rect':
                return '矩形'
            case 'circle':
                return '圆形'
            case 'group':
                return '组合'
            case 'path':
                return '路径'
            case 'line':
                return '线条'
            default:
                return '图层'
        }
    }

    // 获取组内子元素
    const getGroupChildren = (group: fabric.Group): Layer[] => {
        return group.getObjects().map(obj => ({
            id: obj.data?.id || obj.id,
            name: obj.data?.name || getDefaultName(obj.type),
            type: obj.type,
            visible: !obj.invisible,
            locked: obj.locked || false,
            selected: false,
            hasChildren: obj.type === 'group',
            opacity: obj.opacity
        })).reverse()
    }

    // 切换图层可见性
    const toggleVisibility = (layerId: string) => {
        if (!canvas) return

        const object = findObjectById(canvas, layerId)
        if (!object) return

        object.set('invisible', !object.invisible)
        canvas.renderAll()
        updateLayers()
        
        toast({
            description: object.invisible ? "图层已隐藏" : "图层已显示",
            duration: 1500
        })
    }

    // 切换图层锁定状态
    const toggleLock = (layerId: string) => {
        if (!canvas) return

        const object = findObjectById(canvas, layerId)
        if (!object) return

        object.set('locked', !object.locked)
        if (object.locked) {
            object.selectable = false
            object.evented = false
        } else {
            object.selectable = true
            object.evented = true
        }
        canvas.renderAll()
        updateLayers()
        
        toast({
            description: object.locked ? "图层已锁定" : "图层已解锁",
            duration: 1500
        })
    }

    // 复制图层
    const duplicateLayer = (layerId: string) => {
        if (!canvas) return

        const object = findObjectById(canvas, layerId)
        if (!object) return

        object.clone((cloned: fabric.Object) => {
            cloned.set({
                left: (cloned.left || 0) + 20,
                top: (cloned.top || 0) + 20,
                data: { ...object.data, id: Math.random().toString() }
            })
            canvas.add(cloned)
            canvas.setActiveObject(cloned)
            canvas.renderAll()
            updateLayers()
            
            toast({
                description: "图层已复制",
                duration: 1500
            })
        })
    }

    // 删除图层
    const deleteLayer = (layerId: string) => {
        if (!canvas) return

        const object = findObjectById(canvas, layerId)
        if (!object) return

        canvas.remove(object)
        canvas.renderAll()
        updateLayers()
        
        toast({
            description: "图层已删除",
            duration: 1500
        })
    }

    // 选择图层
    const selectLayer = (layerId: string, event: React.MouseEvent) => {
        if (!canvas) return

        const object = findObjectById(canvas, layerId)
        if (!object || object.locked) return

        if (multiSelect && event.shiftKey) {
            // 多选模式
            const activeObjects = canvas.getActiveObjects()
            if (activeObjects.includes(object)) {
                canvas.discardActiveObject()
            } else {
                const selection = new fabric.ActiveSelection([...activeObjects, object], {
                    canvas: canvas
                })
                canvas.setActiveObject(selection)
            }
        } else {
            // 单选模式
            canvas.discardActiveObject()
            canvas.setActiveObject(object)
        }
        
        canvas.renderAll()
        updateLayers()
    }

    // 处理拖拽结束
    const handleDragEnd = (result: DropResult) => {
        setIsDragging(false)
        
        if (!result.destination || !canvas) return

        const sourceIndex = result.source.index
        const destinationIndex = result.destination.index

        if (sourceIndex === destinationIndex) return

        const objects = canvas.getObjects()
        const [removed] = objects.splice(sourceIndex, 1)
        objects.splice(destinationIndex, 0, removed)

        // 更新画布中对象的顺序
        objects.forEach((obj, index) => {
            canvas.moveTo(obj, index)
        })

        canvas.renderAll()
        updateLayers()
        
        toast({
            description: "图层顺序已更新",
            duration: 1500
        })
    }

    // 切换组展开状态
    const toggleExpand = (layerId: string) => {
        setLayers(prev => prev.map(layer => 
            layer.id === layerId 
                ? { ...layer, expanded: !layer.expanded }
                : layer
        ))
    }

    // 新增：移动图层
    const moveLayer = (layerId: string, direction: 'up' | 'down') => {
        if (!canvas) return

        const currentIndex = layers.findIndex(l => l.id === layerId)
        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === layers.length - 1)
        ) return

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        const object = findObjectById(canvas, layerId)
        if (!object) return

        canvas.moveTo(object, canvas.getObjects().length - 1 - newIndex)
        canvas.renderAll()
        updateLayers()

        toast({
            description: `图层已${direction === 'up' ? '上移' : '下移'}`,
            duration: 1500
        })
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h3 className="font-medium flex items-center space-x-2">
                    <Layers className="h-5 w-5" />
                    <span>图层</span>
                </h3>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4">
                    <DragDropContext 
                        onDragEnd={handleDragEnd}
                        onDragStart={() => setIsDragging(true)}
                    >
                        <Droppable droppableId="layers">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-1"
                                >
                                    {layers.map((layer, index) => (
                                        <Draggable
                                            key={layer.id}
                                            draggableId={layer.id}
                                            index={index}
                                            isDragDisabled={layer.locked}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={cn(
                                                        'group relative flex items-center p-2 rounded-lg',
                                                        layer.selected ? 'bg-blue-50' : 'hover:bg-gray-50',
                                                        snapshot.isDragging && 'bg-blue-50/50',
                                                        layer.locked && 'opacity-50'
                                                    )}
                                                >
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        className="mr-2 text-gray-400"
                                                    >
                                                        <GripVertical className="h-4 w-4" />
                                                    </div>

                                                    {layer.hasChildren && (
                                                        <button
                                                            onClick={() => toggleExpand(layer.id)}
                                                            className="mr-1"
                                                        >
                                                            {layer.expanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    )}

                                                    <div
                                                        className="flex-1 cursor-pointer"
                                                        onClick={(e) => selectLayer(layer.id, e)}
                                                    >
                                                        <div className="text-sm font-medium">
                                                            {layer.name}
                                                            {layer.zIndex !== undefined && (
                                                                <span className="ml-2 text-xs text-gray-500">
                                                                    层级: {layer.zIndex}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {layer.opacity !== undefined && layer.opacity !== 1 && (
                                                            <div className="text-xs text-gray-500">
                                                                不透明度: {Math.round(layer.opacity * 100)}%
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center space-x-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => moveLayer(layer.id, 'up')}
                                                            disabled={index === 0}
                                                        >
                                                            <ArrowUp className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => moveLayer(layer.id, 'down')}
                                                            disabled={index === layers.length - 1}
                                                        >
                                                            <ArrowDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => toggleVisibility(layer.id)}
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
                                                            onClick={() => toggleLock(layer.id)}
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
                                                            onClick={() => duplicateLayer(layer.id)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                                            onClick={() => deleteLayer(layer.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    {layer.hasChildren && layer.expanded && layer.children && (
                                                        <div className="ml-6 mt-1 space-y-1">
                                                            {layer.children.map(child => (
                                                                <div
                                                                    key={child.id}
                                                                    className={cn(
                                                                        'flex items-center p-2 rounded-lg',
                                                                        child.selected ? 'bg-blue-50' : 'hover:bg-gray-50',
                                                                        child.locked && 'opacity-50'
                                                                    )}
                                                                >
                                                                    <div
                                                                        className="flex-1 cursor-pointer"
                                                                        onClick={(e) => selectLayer(child.id, e)}
                                                                    >
                                                                        <div className="text-sm">
                                                                            {child.name}
                                                                        </div>
                                                                        {child.opacity !== undefined && child.opacity !== 1 && (
                                                                            <div className="text-xs text-gray-500">
                                                                                不透明度: {Math.round(child.opacity * 100)}%
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </ScrollArea>
        </div>
    )
}

// 通过ID查找画布对象
function findObjectById(canvas: Canvas, id: string): fabric.Object | null {
    const objects = canvas.getObjects()
    return objects.find(obj => (obj.data?.id || obj.id) === id) || null
}