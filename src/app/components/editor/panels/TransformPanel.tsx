'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
    MoveHorizontal,
    MoveVertical,
    Maximize2,
    RotateCw,
    FlipHorizontal,
    FlipVertical
} from 'lucide-react'

interface TransformValues {
    left: number
    top: number
    width: number
    height: number
    scaleX: number
    scaleY: number
    angle: number
    flipX: boolean
    flipY: boolean
}

export function TransformPanel() {
    const { canvas, addHistoryEntry } = useEditorStore()
    const [values, setValues] = useState<TransformValues>({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        flipX: false,
        flipY: false
    })
    const [lockAspectRatio, setLockAspectRatio] = useState(true)

    // 监听选中对象变化
    useEffect(() => {
        if (!canvas) return

        const updateValues = () => {
            const activeObject = canvas.getActiveObject()
            if (!activeObject) return

            setValues({
                left: Math.round(activeObject.left || 0),
                top: Math.round(activeObject.top || 0),
                width: Math.round(activeObject.width! * (activeObject.scaleX || 1)),
                height: Math.round(activeObject.height! * (activeObject.scaleY || 1)),
                scaleX: activeObject.scaleX || 1,
                scaleY: activeObject.scaleY || 1,
                angle: activeObject.angle || 0,
                flipX: activeObject.flipX || false,
                flipY: activeObject.flipY || false
            })
        }

        canvas.on('selection:created', updateValues)
        canvas.on('selection:updated', updateValues)
        canvas.on('selection:cleared', () => {
            setValues({
                left: 0,
                top: 0,
                width: 100,
                height: 100,
                scaleX: 1,
                scaleY: 1,
                angle: 0,
                flipX: false,
                flipY: false
            })
        })
        canvas.on('object:modified', updateValues)

        return () => {
            canvas.off('selection:created', updateValues)
            canvas.off('selection:updated', updateValues)
            canvas.off('selection:cleared')
            canvas.off('object:modified', updateValues)
        }
    }, [canvas])

    const updateObject = useCallback((property: keyof TransformValues, value: number | boolean) => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        switch (property) {
            case 'left':
            case 'top':
            case 'angle':
                activeObject.set(property, value)
                break
            case 'width':
                const newScaleX = (value as number) / activeObject.width!
                activeObject.set('scaleX', newScaleX)
                if (lockAspectRatio) {
                    activeObject.set('scaleY', newScaleX)
                }
                break
            case 'height':
                const newScaleY = (value as number) / activeObject.height!
                activeObject.set('scaleY', newScaleY)
                if (lockAspectRatio) {
                    activeObject.set('scaleX', newScaleY)
                }
                break
            case 'flipX':
            case 'flipY':
                activeObject.set(property, value)
                break
        }

        canvas.renderAll()
        addHistoryEntry()
    }, [canvas, lockAspectRatio])

    return (
        <div className="p-4 space-y-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center">
                        <MoveHorizontal className="h-4 w-4 mr-2" />
                        位置
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs">X</Label>
                            <Input
                                type="number"
                                value={values.left}
                                onChange={(e) => updateObject('left', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Y</Label>
                            <Input
                                type="number"
                                value={values.top}
                                onChange={(e) => updateObject('top', Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <Label className="flex items-center">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        尺寸
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs">宽度</Label>
                            <Input
                                type="number"
                                value={values.width}
                                onChange={(e) => updateObject('width', Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">高度</Label>
                            <Input
                                type="number"
                                value={values.height}
                                onChange={(e) => updateObject('height', Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={lockAspectRatio}
                            onChange={(e) => setLockAspectRatio(e.target.checked)}
                            id="lock-ratio"
                        />
                        <Label htmlFor="lock-ratio" className="text-xs">
                            锁定宽高比
                        </Label>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <Label className="flex items-center">
                        <RotateCw className="h-4 w-4 mr-2" />
                        旋转 ({values.angle}°)
                    </Label>
                    <Slider
                        value={[values.angle]}
                        onValueChange={([value]) => updateObject('angle', value)}
                        min={-180}
                        max={180}
                        step={1}
                    />
                </div>

                <Separator />

                <div className="space-y-2">
                    <Label>翻转</Label>
                    <div className="flex space-x-2">
                        <Button
                            variant={values.flipX ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateObject('flipX', !values.flipX)}
                        >
                            <FlipHorizontal className="h-4 w-4 mr-2" />
                            水平翻转
                        </Button>
                        <Button
                            variant={values.flipY ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateObject('flipY', !values.flipY)}
                        >
                            <FlipVertical className="h-4 w-4 mr-2" />
                            垂直翻转
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}