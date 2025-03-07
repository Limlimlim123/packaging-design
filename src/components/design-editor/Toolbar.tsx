'use client'

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { 
    Trash,
    Copy,
    FlipHorizontal,
    FlipVertical,
    RotateCw,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Underline,
    Type,
    MoveVertical,
    Lock,
    Unlock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolbarProps {
    canvas: fabric.Canvas | null
    activeObject: fabric.Object | null
    onUpdate: () => void
}

export function Toolbar({ canvas, activeObject, onUpdate }: ToolbarProps) {
    if (!canvas) return null

    // 基础对象操作
    const handleDelete = useCallback(() => {
        if (!activeObject) return
        canvas.remove(activeObject)
        canvas.renderAll()
        onUpdate()
    }, [canvas, activeObject])

    const handleCopy = useCallback(() => {
        if (!activeObject) return
        activeObject.clone((cloned: fabric.Object) => {
            canvas.add(
                cloned.set({
                    left: (cloned.left || 0) + 20,
                    top: (cloned.top || 0) + 20,
                    evented: true,
                })
            )
            canvas.setActiveObject(cloned)
            canvas.renderAll()
            onUpdate()
        })
    }, [canvas, activeObject])

    // 文本样式操作
    const updateTextStyle = useCallback((property: string, value: any) => {
        if (!activeObject || !activeObject.isType('text')) return
        
        activeObject.set(property, value)
        canvas.renderAll()
        onUpdate()
    }, [canvas, activeObject])

    // 对象变换操作
    const transformObject = useCallback((transformation: string) => {
        if (!activeObject) return

        switch (transformation) {
            case 'flipX':
                activeObject.set('flipX', !activeObject.flipX)
                break
            case 'flipY':
                activeObject.set('flipY', !activeObject.flipY)
                break
            case 'rotate':
                activeObject.rotate((activeObject.angle || 0) + 90)
                break
            case 'lock':
                const isLocked = activeObject.lockMovementX && activeObject.lockMovementY
                activeObject.set({
                    lockMovementX: !isLocked,
                    lockMovementY: !isLocked,
                    lockRotation: !isLocked,
                    lockScalingX: !isLocked,
                    lockScalingY: !isLocked,
                    selectable: isLocked,
                    evented: isLocked,
                })
                break
        }
        
        canvas.renderAll()
        onUpdate()
    }, [canvas, activeObject])

    // 对齐操作
    const alignObject = useCallback((alignment: string) => {
        if (!activeObject) return

        let value: string
        switch (alignment) {
            case 'left':
                value = activeObject.getScaledWidth() / 2
                break
            case 'center':
                value = canvas.getWidth() / 2
                break
            case 'right':
                value = canvas.getWidth() - activeObject.getScaledWidth() / 2
                break
            default:
                return
        }

        activeObject.set({
            left: value,
            originX: 'center'
        })
        
        canvas.renderAll()
        onUpdate()
    }, [canvas, activeObject])

    const isTextObject = activeObject?.isType('text')
    const isLocked = activeObject?.lockMovementX && activeObject?.lockMovementY

    return (
        <div className="space-y-4">
            {activeObject && (
                <>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDelete}
                            title="删除 (Delete)"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopy}
                            title="复制 (Ctrl+C)"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => transformObject('lock')}
                            title={isLocked ? '解锁' : '锁定'}
                        >
                            {isLocked ? (
                                <Lock className="h-4 w-4" />
                            ) : (
                                <Unlock className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => transformObject('flipX')}
                            title="水平翻转"
                        >
                            <FlipHorizontal className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => transformObject('flipY')}
                            title="垂直翻转"
                        >
                            <FlipVertical className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => transformObject('rotate')}
                            title="旋转90度"
                        >
                            <RotateCw className="h-4 w-4" />
                        </Button>
                    </div>

                    {isTextObject && (
                        <>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateTextStyle('fontWeight', 
                                        activeObject.get('fontWeight') === 'bold' ? 'normal' : 'bold'
                                    )}
                                    className={cn(
                                        activeObject.get('fontWeight') === 'bold' && 'bg-gray-100'
                                    )}
                                >
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateTextStyle('fontStyle',
                                        activeObject.get('fontStyle') === 'italic' ? 'normal' : 'italic'
                                    )}
                                    className={cn(
                                        activeObject.get('fontStyle') === 'italic' && 'bg-gray-100'
                                    )}
                                >
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateTextStyle('underline',
                                        !activeObject.get('underline')
                                    )}
                                    className={cn(
                                        activeObject.get('underline') && 'bg-gray-100'
                                    )}
                                >
                                    <Underline className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => alignObject('left')}
                                >
                                    <AlignLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => alignObject('center')}
                                >
                                    <AlignCenter className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => alignObject('right')}
                                >
                                    <AlignRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}