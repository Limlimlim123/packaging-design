'use client'

import { useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from '@/components/ui/color-picker'
import {
    Grid,
    RulerSquare,
    Crosshair,
    LineHeight,
    AlignVerticalJustifyCenter,
    Ruler
} from 'lucide-react'

interface GuideSettings {
    showGrid: boolean
    gridSize: number
    gridColor: string
    showRulers: boolean
    showGuides: boolean
    guideColor: string
    snapToGrid: boolean
    snapToObjects: boolean
    snapTolerance: number
}

export function GuidePanel() {
    const { canvas, addHistoryEntry } = useEditorStore()
    const [settings, setSettings] = useState<GuideSettings>({
        showGrid: false,
        gridSize: 20,
        gridColor: '#cccccc',
        showRulers: true,
        showGuides: true,
        guideColor: '#ff4444',
        snapToGrid: true,
        snapToObjects: true,
        snapTolerance: 10
    })

    const updateSettings = useCallback((key: keyof GuideSettings, value: any) => {
        if (!canvas) return

        setSettings(prev => ({ ...prev, [key]: value }))

        switch (key) {
            case 'showGrid':
                canvas.setBackgroundColor(value ? createGridPattern() : '#ffffff', () => {
                    canvas.renderAll()
                })
                break
            case 'gridSize':
            case 'gridColor':
                if (settings.showGrid) {
                    canvas.setBackgroundColor(createGridPattern(), () => {
                        canvas.renderAll()
                    })
                }
                break
            case 'snapToGrid':
                canvas.set('snapToGrid', value)
                canvas.set('gridSize', settings.gridSize)
                break
            case 'snapToObjects':
                canvas.set('snapToObjects', value)
                break
            case 'snapTolerance':
                canvas.set('snapTolerance', value)
                break
        }

        addHistoryEntry()
    }, [canvas, settings])

    const createGridPattern = useCallback(() => {
        const gridSize = settings.gridSize
        const patternCanvas = document.createElement('canvas')
        const ctx = patternCanvas.getContext('2d')
        if (!ctx) return '#ffffff'

        patternCanvas.width = gridSize
        patternCanvas.height = gridSize

        ctx.strokeStyle = settings.gridColor
        ctx.lineWidth = 0.5

        // 绘制网格线
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, gridSize)
        ctx.moveTo(0, 0)
        ctx.lineTo(gridSize, 0)
        ctx.stroke()

        return new fabric.Pattern({
            source: patternCanvas,
            repeat: 'repeat'
        })
    }, [settings.gridSize, settings.gridColor])

    const addGuide = useCallback((orientation: 'horizontal' | 'vertical') => {
        if (!canvas) return

        const guide = new fabric.Line(
            orientation === 'horizontal' ? 
                [0, canvas.height! / 2, canvas.width!, canvas.height! / 2] :
                [canvas.width! / 2, 0, canvas.width! / 2, canvas.height!],
            {
                stroke: settings.guideColor,
                strokeWidth: 1,
                selectable: true,
                evented: true,
                lockMovementX: orientation === 'horizontal',
                lockMovementY: orientation === 'vertical',
                hasBorders: false,
                hasControls: false,
                originX: 'center',
                originY: 'center',
                guide: true
            }
        )

        canvas.add(guide)
        canvas.renderAll()
        addHistoryEntry()
    }, [canvas, settings.guideColor])

    return (
        <div className="p-4 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                        <Grid className="h-4 w-4 mr-2" />
                        显示网格
                    </Label>
                    <Switch
                        checked={settings.showGrid}
                        onCheckedChange={(checked) => updateSettings('showGrid', checked)}
                    />
                </div>

                {settings.showGrid && (
                    <>
                        <div className="space-y-2">
                            <Label>网格大小</Label>
                            <Input
                                type="number"
                                value={settings.gridSize}
                                onChange={(e) => updateSettings('gridSize', Number(e.target.value))}
                                min={5}
                                max={100}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>网格颜色</Label>
                            <ColorPicker
                                color={settings.gridColor}
                                onChange={(color) => updateSettings('gridColor', color)}
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                        <RulerSquare className="h-4 w-4 mr-2" />
                        显示标尺
                    </Label>
                    <Switch
                        checked={settings.showRulers}
                        onCheckedChange={(checked) => updateSettings('showRulers', checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                        <Ruler className="h-4 w-4 mr-2" />
                        显示参考线
                    </Label>
                    <Switch
                        checked={settings.showGuides}
                        onCheckedChange={(checked) => updateSettings('showGuides', checked)}
                    />
                </div>

                {settings.showGuides && (
                    <>
                        <div className="space-y-2">
                            <Label>参考线颜色</Label>
                            <ColorPicker
                                color={settings.guideColor}
                                onChange={(color) => updateSettings('guideColor', color)}
                            />
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => addGuide('horizontal')}
                            >
                                <LineHeight className="h-4 w-4 mr-2" />
                                添加水平参考线
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => addGuide('vertical')}
                            >
                                <AlignVerticalJustifyCenter className="h-4 w-4 mr-2" />
                                添加垂直参考线
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                        <Crosshair className="h-4 w-4 mr-2" />
                        对齐设置
                    </Label>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>对齐网格</Label>
                        <Switch
                            checked={settings.snapToGrid}
                            onCheckedChange={(checked) => updateSettings('snapToGrid', checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>对齐对象</Label>
                        <Switch
                            checked={settings.snapToObjects}
                            onCheckedChange={(checked) => updateSettings('snapToObjects', checked)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>对齐容差</Label>
                        <Input
                            type="number"
                            value={settings.snapTolerance}
                            onChange={(e) => updateSettings('snapTolerance', Number(e.target.value))}
                            min={1}
                            max={50}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}