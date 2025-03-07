'use client'

import { useCallback } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    MoveUp,
    MoveDown,
    ArrowUpToLine,
    ArrowDownToLine,
    Group,
    Ungroup,
    Lock,
    Unlock,
    Copy,
    Trash2
} from 'lucide-react'

export function ArrangePanel() {
    const { canvas, addHistoryEntry } = useEditorStore()

    const moveLayer = useCallback((direction: 'up' | 'down' | 'front' | 'back') => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        switch (direction) {
            case 'up':
                activeObject.bringForward()
                break
            case 'down':
                activeObject.sendBackwards()
                break
            case 'front':
                activeObject.bringToFront()
                break
            case 'back':
                activeObject.sendToBack()
                break
        }

        canvas.renderAll()
        addHistoryEntry()
    }, [canvas])

    const handleGroup = useCallback(() => {
        if (!canvas) return

        const activeObjects = canvas.getActiveObjects()
        if (activeObjects.length < 2) return

        const group = new fabric.Group(activeObjects)
        canvas.discardActiveObject()
        
        // 移除原对象
        activeObjects.forEach(obj => canvas.remove(obj))
        
        canvas.add(group)
        canvas.setActiveObject(group)
        canvas.renderAll()
        addHistoryEntry()
    }, [canvas])

    const handleUngroup = useCallback(() => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject || !activeObject.isType('group')) return

        const items = (activeObject as fabric.Group).getObjects()
        const group = activeObject as fabric.Group
        
        // 获取组的属性
        const { left, top } = group
        
        // 解组
        group.destroy()
        canvas.remove(activeObject)

        // 添加原对象并保持相对位置
        items.forEach(obj => {
            canvas.add(obj)
            obj.set({
                left: left! + obj.left!,
                top: top! + obj.top!
            })
        })

        canvas.renderAll()
        addHistoryEntry()
    }, [canvas])

    const toggleLock = useCallback(() => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        activeObject.set('locked', !activeObject.locked)
        canvas.renderAll()
        addHistoryEntry()
    }, [canvas])

    const duplicate = useCallback(() => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        activeObject.clone((cloned: fabric.Object) => {
            cloned.set({
                left: activeObject.left! + 20,
                top: activeObject.top! + 20
            })
            canvas.add(cloned)
            canvas.setActiveObject(cloned)
            canvas.renderAll()
            addHistoryEntry()
        })
    }, [canvas])

    const remove = useCallback(() => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        canvas.remove(activeObject)
        canvas.renderAll()
        addHistoryEntry()
    }, [canvas])

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-2">
                <div className="text-sm font-medium">图层排序</div>
                <div className="flex space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => moveLayer('up')}
                            >
                                <MoveUp className="h-4 w-4" />
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
                                <MoveDown className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>下移一层</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-9" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => moveLayer('front')}
                            >
                                <ArrowUpToLine className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>移到最上层</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => moveLayer('back')}
                            >
                                <ArrowDownToLine className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>移到最下层</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-sm font-medium">组合操作</div>
                <div className="flex space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleGroup}
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
                                onClick={handleUngroup}
                            >
                                <Ungroup className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>解组</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="h-9" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleLock}
                            >
                                <Lock className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>锁定/解锁</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-sm font-medium">其他操作</div>
                <div className="flex space-x-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={duplicate}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>复制</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={remove}
                                className="text-red-500 hover:text-red-600"
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