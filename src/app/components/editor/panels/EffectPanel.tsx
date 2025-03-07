'use client'

import { useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/ui/color-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Droplets,
    Box,
    ShadowIcon,
    Blend,
    Layers,
    MoveUpRight
} from 'lucide-react'

export function EffectPanel() {
    const { canvas, addHistoryEntry } = useEditorStore()
    const [opacity, setOpacity] = useState(1)
    const [blur, setBlur] = useState(0)
    const [shadowColor, setShadowColor] = useState('#000000')
    const [shadowOffset, setShadowOffset] = useState({ x: 5, y: 5 })
    const [shadowBlur, setShadowBlur] = useState(10)

    const updateEffect = useCallback((effect: string, value: any) => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject) return

        switch (effect) {
            case 'opacity':
                activeObject.set('opacity', value)
                break
            case 'blur':
                if (activeObject.filters) {
                    const blurFilter = new fabric.Image.filters.Blur({
                        blur: value
                    })
                    activeObject.filters = [blurFilter]
                    activeObject.applyFilters()
                }
                break
            case 'shadow':
                activeObject.set('shadow', new fabric.Shadow({
                    color: shadowColor,
                    offsetX: shadowOffset.x,
                    offsetY: shadowOffset.y,
                    blur: shadowBlur
                }))
                break
            case 'blend':
                // 实现混合模式
                if (activeObject.globalCompositeOperation) {
                    activeObject.set('globalCompositeOperation', value)
                }
                break
        }

        canvas.renderAll()
        addHistoryEntry()
    }, [canvas, shadowColor, shadowOffset, shadowBlur])

    return (
        <div className="p-4 space-y-4">
            <Tabs defaultValue="basic">
                <TabsList className="w-full">
                    <TabsTrigger value="basic" className="flex-1">
                        基础效果
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex-1">
                        高级效果
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center">
                                <Droplets className="h-4 w-4 mr-2" />
                                不透明度
                            </Label>
                            <Slider
                                value={[opacity]}
                                onValueChange={([value]) => {
                                    setOpacity(value)
                                    updateEffect('opacity', value)
                                }}
                                min={0}
                                max={1}
                                step={0.1}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center">
                                <Box className="h-4 w-4 mr-2" />
                                模糊
                            </Label>
                            <Slider
                                value={[blur]}
                                onValueChange={([value]) => {
                                    setBlur(value)
                                    updateEffect('blur', value)
                                }}
                                min={0}
                                max={1}
                                step={0.1}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center">
                                <ShadowIcon className="h-4 w-4 mr-2" />
                                阴影
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs">颜色</Label>
                                    <ColorPicker
                                        color={shadowColor}
                                        onChange={(color) => {
                                            setShadowColor(color)
                                            updateEffect('shadow', null)
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">模糊</Label>
                                    <Slider
                                        value={[shadowBlur]}
                                        onValueChange={([value]) => {
                                            setShadowBlur(value)
                                            updateEffect('shadow', null)
                                        }}
                                        min={0}
                                        max={50}
                                        step={1}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs">X偏移</Label>
                                    <Slider
                                        value={[shadowOffset.x]}
                                        onValueChange={([value]) => {
                                            setShadowOffset(prev => ({
                                                ...prev,
                                                x: value
                                            }))
                                            updateEffect('shadow', null)
                                        }}
                                        min={-50}
                                        max={50}
                                        step={1}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Y偏移</Label>
                                    <Slider
                                        value={[shadowOffset.y]}
                                        onValueChange={([value]) => {
                                            setShadowOffset(prev => ({
                                                ...prev,
                                                y: value
                                            }))
                                            updateEffect('shadow', null)
                                        }}
                                        min={-50}
                                        max={50}
                                        step={1}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center">
                                <Blend className="h-4 w-4 mr-2" />
                                混合模式
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    'normal',
                                    'multiply',
                                    'screen',
                                    'overlay',
                                    'darken',
                                    'lighten',
                                    'color-dodge',
                                    'color-burn'
                                ].map(mode => (
                                    <Button
                                        key={mode}
                                        variant="outline"
                                        onClick={() => updateEffect('blend', mode)}
                                        className="capitalize"
                                    >
                                        {mode}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}