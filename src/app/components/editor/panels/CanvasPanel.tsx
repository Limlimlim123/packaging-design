'use client'

import { useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ColorPicker } from '@/components/ui/color-picker'
import {
    Maximize2,
    Monitor,
    Smartphone,
    Tablet,
    Lock,
    Unlock,
    ZoomIn,
    ZoomOut,
    RotateCw
} from 'lucide-react'

interface CanvasSettings {
    width: number
    height: number
    backgroundColor: string
    zoom: number
    rotation: number
    lockRatio: boolean
    responsive: boolean
    devicePreset: string
}

const devicePresets = {
    'custom': { label: '自定义', width: 800, height: 600 },
    'desktop': { label: '桌面', width: 1920, height: 1080 },
    'tablet': { label: '平板', width: 1024, height: 768 },
    'mobile': { label: '手机', width: 375, height: 667 }
}

export function CanvasPanel() {
    const { canvas, addHistoryEntry } = useEditorStore()
    const [settings, setSettings] = useState<CanvasSettings>({
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        zoom: 1,
        rotation: 0,
        lockRatio: true,
        responsive: false,
        devicePreset: 'custom'
    })

    const updateSettings = useCallback((key: keyof CanvasSettings, value: any) => {
        if (!canvas) return

        setSettings(prev => ({ ...prev, [key]: value }))

        switch (key) {
            case 'width':
            case 'height':
                const newSize = { 
                    width: key === 'width' ? value : settings.width,
                    height: key === 'height' ? value : settings.height
                }
                
                if (settings.lockRatio && key === 'width') {
                    newSize.height = Math.round(value * (settings.height / settings.width))
                } else if (settings.lockRatio && key === 'height') {
                    newSize.width = Math.round(value * (settings.width / settings.height))
                }

                canvas.setDimensions(newSize)
                canvas.renderAll()
                break

            case 'backgroundColor':
                canvas.setBackgroundColor(value, () => {
                    canvas.renderAll()
                })
                break

            case 'zoom':
                canvas.setZoom(value)
                canvas.renderAll()
                break

            case 'rotation':
                canvas.setViewportTransform([
                    Math.cos(value * Math.PI / 180),
                    Math.sin(value * Math.PI / 180),
                    -Math.sin(value * Math.PI / 180),
                    Math.cos(value * Math.PI / 180),
                    canvas.width! / 2,
                    canvas.height! / 2
                ])
                canvas.renderAll()
                break

            case 'devicePreset':
                const preset = devicePresets[value as keyof typeof devicePresets]
                if (preset) {
                    setSettings(prev => ({
                        ...prev,
                        width: preset.width,
                        height: preset.height
                    }))
                    canvas.setDimensions({
                        width: preset.width,
                        height: preset.height
                    })
                    canvas.renderAll()
                }
                break
        }

        addHistoryEntry()
    }, [canvas, settings])

    const handleZoom = useCallback((direction: 'in' | 'out') => {
        const newZoom = direction === 'in' ? 
            Math.min(settings.zoom + 0.1, 5) : 
            Math.max(settings.zoom - 0.1, 0.1)
        updateSettings('zoom', newZoom)
    }, [settings.zoom, updateSettings])

    return (
        <div className="p-4 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        画布尺寸
                    </Label>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateSettings('lockRatio', !settings.lockRatio)}
                        >
                            {settings.lockRatio ? (
                                <Lock className="h-4 w-4" />
                            ) : (
                                <Unlock className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <Select
                    value={settings.devicePreset}
                    onValueChange={(value) => updateSettings('devicePreset', value)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(devicePresets).map(([key, preset]) => (
                            <SelectItem key={key} value={key}>
                                <div className="flex items-center">
                                    {key === 'desktop' && <Monitor className="h-4 w-4 mr-2" />}
                                    {key === 'tablet' && <Tablet className="h-4 w-4 mr-2" />}
                                    {key === 'mobile' && <Smartphone className="h-4 w-4 mr-2" />}
                                    {preset.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>宽度</Label>
                        <Input
                            type="number"
                            value={settings.width}
                            onChange={(e) => updateSettings('width', Number(e.target.value))}
                            min={1}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>高度</Label>
                        <Input
                            type="number"
                            value={settings.height}
                            onChange={(e) => updateSettings('height', Number(e.target.value))}
                            min={1}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <Label>背景颜色</Label>
                <ColorPicker
                    color={settings.backgroundColor}
                    onChange={(color) => updateSettings('backgroundColor', color)}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>缩放 ({Math.round(settings.zoom * 100)}%)</Label>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleZoom('out')}
                            disabled={settings.zoom <= 0.1}
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleZoom('in')}
                            disabled={settings.zoom >= 5}
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                        <RotateCw className="h-4 w-4 mr-2" />
                        画布旋转 ({settings.rotation}°)
                    </Label>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSettings('rotation', (settings.rotation + 90) % 360)}
                    >
                        旋转90°
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Label>响应式画布</Label>
                <Switch
                    checked={settings.responsive}
                    onCheckedChange={(checked) => updateSettings('responsive', checked)}
                />
            </div>
        </div>
    )
}