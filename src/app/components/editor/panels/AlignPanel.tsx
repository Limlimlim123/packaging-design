'use client'

import { useCallback } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    ArrowUpToLine,
    ArrowDownToLine,
    ArrowUp,
    ArrowDown,
    Group,
    Ungroup,
    Lock,
    Copy,
    Trash2
} from 'lucide-react'

// 声明全局 fabric 变量
declare const fabric: any

// 为 fabric 对象定义类型
interface FabricObject extends fabric.Object {
    locked?: boolean
    getObjects?: () => FabricObject[]
    destroy?: () => void
}

export function ArrangePanel() {
    const { canvas, activeObject } = useEditorStore()

    const moveLayer = useCallback((direction: 'up' | 'down' | 'top' | 'bottom') => {
        if (!canvas || !activeObject) return

        switch (direction) {
            case 'up':
                activeObject.bringForward()
                break
            case 'down':
                activeObject.sendBackwards()
                break
            case 'top':
                activeObject.bringToFront()
                break
            case 'bottom':
                activeObject.sendToBack()
                break
        }

        canvas.renderAll()
    }, [canvas, activeObject])

    const groupObjects = useCallback(() => {
        if (!canvas) return

        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length < 2) return

        const group = new fabric.Group(activeObjects)
        canvas.discardActiveObject()
        
        // 移除原始对象
        activeObjects.forEach((obj: FabricObject) => canvas.remove(obj))
        
        // 添加组
        canvas.add(group)
        canvas.setActiveObject(group)
        canvas.renderAll()
    }, [canvas])

    const ungroupObjects = useCallback(() => {
        if (!canvas || !activeObject) return

        const group = activeObject as FabricObject
        if (!(group instanceof fabric.Group)) return

        // 获取组的位置和缩放信息
        const { left, top } = group
        const items = group.getObjects?.() || []
        
        // 解组
        group.destroy?.()
        canvas.remove(group)
        
        // 添加原始对象
        items.forEach((obj: FabricObject) => {
            canvas.add(obj)
            obj.set({
                left: (left ?? 0) + (obj.left ?? 0),
                top: (top ?? 0) + (obj.top ?? 0)
            })
        })
        
        // 选中所有解组后的对象
        canvas.setActiveObject(new fabric.ActiveSelection(items, { canvas }))
        canvas.renderAll()
    }, [canvas, activeObject])

    const lockObject = useCallback(() => {
        if (!canvas || !activeObject) return

        const obj = activeObject as FabricObject
        const isLocked = obj.locked || false

        obj.set({
            locked: !isLocked,
            lockMovementX: !isLocked,
            lockMovementY: !isLocked,
            lockRotation: !isLocked,
            lockScalingX: !isLocked,
            lockScalingY: !isLocked,
            hasControls: isLocked,
            selectable: isLocked
        })

        canvas.renderAll()
    }, [canvas, activeObject])

    const duplicateObject = useCallback(() => {
        if (!canvas || !activeObject) return

        activeObject.clone((cloned: FabricObject) => {
            cloned.set({
                left: (cloned.left ?? 0) + 10,
                top: (cloned.top ?? 0) + 10
            })
            canvas.add(cloned)
            canvas.setActiveObject(cloned)
            canvas.renderAll()
        })
    }, [canvas, activeObject])

    const deleteObject = useCallback(() => {
        if (!canvas || !activeObject) return

        canvas.remove(activeObject)
        canvas.renderAll()
    }, [canvas, activeObject])

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-2">
                <div className="text-sm font-medium">图层</div>
                <div className="flex space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => moveLayer('up')}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>上移一层</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => moveLayer('down')}
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>下移一层</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => moveLayer('top')}
                            >
                                <ArrowUpToLine className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>移到顶层</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => moveLayer('bottom')}
                            >
                                <ArrowDownToLine className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>移到底层</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <Separator />

            <div className="space-y-2">
                <div className="text-sm font-medium">组合</div>
                <div className="flex space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={groupObjects}
                            >
                                <Group className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>组合</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={ungroupObjects}
                            >
                                <Ungroup className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>解组</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <Separator />

            <div className="space-y-2">
                <div className="text-sm font-medium">操作</div>
                <div className="flex space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={lockObject}
                            >
                                <Lock className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>锁定/解锁</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={duplicateObject}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>复制</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={deleteObject}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>删除</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    )
}