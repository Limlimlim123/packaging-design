'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import {
    Layers,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    ChevronDown,
    ChevronRight,
    Search,
    Plus,
    Minus,
    Copy,
    Trash2,
    FolderPlus
} from 'lucide-react'

interface Layer {
    id: string
    name: string
    type: string
    visible: boolean
    locked: boolean
    object: fabric.Object
    children?: Layer[]
    isGroup?: boolean
    isExpanded?: boolean
}

export function LayerPanel() {
    const { canvas, addToHistory } = useEditorStore()
    const { toast } = useToast()
    const [layers, setLayers] = useState<Layer[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLayer, setSelectedLayer] = useState<string | null>(null)

    // 更新图层列表
    const updateLayers = useCallback(() => {
        if (!canvas) return

        const objects = canvas.getObjects()
        const newLayers: Layer[] = objects.map(obj => ({
            id: obj.id as string || Math.random().toString(),
            name: obj.name as string || obj.type,
            type: obj.type as string,
            visible: obj.visible !== false,
            locked: obj.locked || false,
            object: obj,
            isGroup: obj.type === 'group',
            isExpanded: false,
            children: obj.type === 'group' ? 
                (obj as fabric.Group).getObjects().map(child => ({
                    id: child.id as string || Math.random().toString(),
                    name: child.name as string || child.type,
                    type: child.type as string,
                    visible: child.visible !== false,
                    locked: child.locked || false,
                    object: child
                })) : 
                undefined
        }))

        setLayers(newLayers.reverse())
    }, [canvas])

    useEffect(() => {
        if (!canvas) return

        const handlers = {
            objectAdded: updateLayers,
            objectRemoved: updateLayers,
            objectModified: updateLayers,
            selectionCreated: (e: any) => {
                const activeObject = e.selected?.[0]
                if (activeObject) {
                    setSelectedLayer(activeObject.id as string)
                }
            },
            selectionCleared: () => {
                setSelectedLayer(null)
            }
        }

        Object.entries(handlers).forEach(([event, handler]) => {
            canvas.on(event, handler)
        })

        updateLayers()

        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                canvas.off(event, handler)
            })
        }
    }, [canvas, updateLayers])

    const toggleVisibility = useCallback((layerId: string) => {
        if (!canvas) return

        try {
            const layer = layers.find(l => l.id === layerId)
            if (!layer) return

            layer.object.set('visible', !layer.visible)
            if (layer.children) {
                layer.children.forEach(child => {
                    child.object.set('visible', !layer.visible)
                })
            }

            canvas.renderAll()
            updateLayers()
            addToHistory()
        } catch (error) {
            console.error('切换可见性失败:', error)
            toast({
                title: "操作失败",
                description: "无法切换图层可见性",
                variant: "destructive"
            })
        }
    }, [canvas, layers])

    const toggleLock = useCallback((layerId: string) => {
        if (!canvas) return

        try {
            const layer = layers.find(l => l.id === layerId)
            if (!layer) return

            layer.object.set('locked', !layer.locked)
            if (layer.children) {
                layer.children.forEach(child => {
                    child.object.set('locked', !layer.locked)
                })
            }

            canvas.renderAll()
            updateLayers()
            addToHistory()
        } catch (error) {
            console.error('切换锁定状态失败:', error)
            toast({
                title: "操作失败",
                description: "无法切换图层锁定状态",
                variant: "destructive"
            })
        }
    }, [canvas, layers])

    const selectLayer = useCallback((layerId: string) => {
        if (!canvas) return

        try {
            const layer = layers.find(l => l.id === layerId)
            if (!layer) return

            canvas.setActiveObject(layer.object)
            canvas.renderAll()
            setSelectedLayer(layerId)
        } catch (error) {
            console.error('选择图层失败:', error)
            toast({
                title: "操作失败",
                description: "无法选择图层",
                variant: "destructive"
            })
        }
    }, [canvas, layers])

    const moveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
        if (!canvas) return

        try {
            const layer = layers.find(l => l.id === layerId)
            if (!layer) return

            const index = canvas.getObjects().indexOf(layer.object)
            if (direction === 'up' && index < canvas.getObjects().length - 1) {
                canvas.moveTo(layer.object, index + 1)
            } else if (direction === 'down' && index > 0) {
                canvas.moveTo(layer.object, index - 1)
            }

            canvas.renderAll()
            updateLayers()
            addToHistory()
        } catch (error) {
            console.error('移动图层失败:', error)
            toast({
                title: "操作失败",
                description: "无法移动图层",
                variant: "destructive"
            })
        }
    }, [canvas, layers])

    const duplicateLayer = useCallback((layerId: string) => {
        if (!canvas) return

        try {
            const layer = layers.find(l => l.id === layerId)
            if (!layer) return

            layer.object.clone((cloned: fabric.Object) => {
                cloned.set({
                    left: layer.object.left! + 10,
                    top: layer.object.top! + 10
                })
                canvas.add(cloned)
                canvas.setActiveObject(cloned)
                canvas.renderAll()
                addToHistory()
            })
        } catch (error) {
            console.error('复制图层失败:', error)
            toast({
                title: "操作失败",
                description: "无法复制图层",
                variant: "destructive"
            })
        }
    }, [canvas, layers])

    const deleteLayer = useCallback((layerId: string) => {
        if (!canvas) return

        try {
            const layer = layers.find(l => l.id === layerId)
            if (!layer) return

            canvas.remove(layer.object)
            canvas.renderAll()
            addToHistory()
            toast({
                description: "已删除图层"
            })
        } catch (error) {
            console.error('删除图层失败:', error)
            toast({
                title: "操作失败",
                description: "无法删除图层",
                variant: "destructive"
            })
        }
    }, [canvas, layers])

    const filteredLayers = layers.filter(layer => 
        layer.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索图层..."
                    className="pl-9"
                />
            </div>

            <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                    {filteredLayers.map(layer => (
                        <div key={layer.id}>
                            <div
                                className={`flex items-center p-2 rounded-lg hover:bg-accent ${
                                    selectedLayer === layer.id ? 'bg-accent' : ''
                                }`}
                                onClick={() => selectLayer(layer.id)}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (layer.isGroup) {
                                            layer.isExpanded = !layer.isExpanded
                                            updateLayers()
                                        }
                                    }}
                                >
                                    {layer.isGroup ? (
                                        layer.isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )
                                    ) : null}
                                </Button>

                                <span className="flex-1 ml-2 text-sm truncate">
                                    {layer.name}
                                </span>

                                <div className="flex items-center space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleVisibility(layer.id)
                                        }}
                                        title={layer.visible ? "隐藏" : "显示"}
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
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleLock(layer.id)
                                        }}
                                        title={layer.locked ? "解锁" : "锁定"}
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
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            moveLayer(layer.id, 'up')
                                        }}
                                        title="上移"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            moveLayer(layer.id, 'down')
                                        }}
                                        title="下移"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            duplicateLayer(layer.id)
                                        }}
                                        title="复制"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-red-500 hover:text-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteLayer(layer.id)
                                        }}
                                        title="删除"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {layer.isGroup && layer.isExpanded && layer.children && (
                                <div className="ml-6 space-y-1">
                                    {layer.children.map(child => (
                                        <div
                                            key={child.id}
                                            className={`flex items-center p-2 rounded-lg hover:bg-accent ${
                                                selectedLayer === child.id ? 'bg-accent' : ''
                                            }`}
                                            onClick={() => selectLayer(child.id)}
                                        >
                                            <span className="flex-1 ml-2 text-sm truncate">
                                                {child.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}