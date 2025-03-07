'use client'

import { useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
    Settings,
    Monitor,
    MousePointer2,
    Grid,
    Ruler,
    Save,
    RotateCw,
    Undo,
    Redo,
    Keyboard
} from 'lucide-react'

interface EditorSettings {
    theme: 'light' | 'dark' | 'system'
    language: string
    autoSave: boolean
    autoSaveInterval: number
    showRulers: boolean
    showGrid: boolean
    snapToGrid: boolean
    gridSize: number
    snapToObjects: boolean
    snapTolerance: number
    undoLimit: number
    defaultUnit: 'px' | 'mm' | 'cm' | 'in'
    zoomSpeed: number
    rotationSnap: number
    shortcuts: {
        [key: string]: string
    }
}

const defaultShortcuts = {
    undo: 'Ctrl+Z',
    redo: 'Ctrl+Y',
    save: 'Ctrl+S',
    copy: 'Ctrl+C',
    paste: 'Ctrl+V',
    delete: 'Delete',
    selectAll: 'Ctrl+A',
    group: 'Ctrl+G',
    ungroup: 'Ctrl+Shift+G',
    bringForward: 'Ctrl+]',
    sendBackward: 'Ctrl+[',
    zoomIn: 'Ctrl++',
    zoomOut: 'Ctrl+-',
    resetZoom: 'Ctrl+0',
    toggleRulers: 'Ctrl+R',
    toggleGrid: 'Ctrl+\'',
}

export function SettingsPanel() {
    const { canvas, addHistoryEntry } = useEditorStore()
    const [settings, setSettings] = useState<EditorSettings>({
        theme: 'system',
        language: 'zh-CN',
        autoSave: true,
        autoSaveInterval: 5,
        showRulers: true,
        showGrid: false,
        snapToGrid: true,
        gridSize: 20,
        snapToObjects: true,
        snapTolerance: 10,
        undoLimit: 50,
        defaultUnit: 'px',
        zoomSpeed: 1.1,
        rotationSnap: 15,
        shortcuts: { ...defaultShortcuts }
    })

    const updateSettings = useCallback((key: keyof EditorSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))

        // 应用设置
        switch (key) {
            case 'theme':
                document.documentElement.classList.remove('light', 'dark')
                if (value !== 'system') {
                    document.documentElement.classList.add(value)
                }
                break

            case 'showRulers':
            case 'showGrid':
            case 'snapToGrid':
            case 'snapToObjects':
                if (canvas) {
                    canvas.set(key, value)
                    canvas.renderAll()
                }
                break

            case 'gridSize':
            case 'snapTolerance':
                if (canvas) {
                    canvas.set(key, value)
                    canvas.renderAll()
                }
                break

            case 'autoSave':
                // 实现自动保存逻辑
                break
        }

        // 保存设置到本地存储
        localStorage.setItem('editorSettings', JSON.stringify({
            ...settings,
            [key]: value
        }))
    }, [canvas, settings])

    const resetSettings = useCallback(() => {
        setSettings({
            theme: 'system',
            language: 'zh-CN',
            autoSave: true,
            autoSaveInterval: 5,
            showRulers: true,
            showGrid: false,
            snapToGrid: true,
            gridSize: 20,
            snapToObjects: true,
            snapTolerance: 10,
            undoLimit: 50,
            defaultUnit: 'px',
            zoomSpeed: 1.1,
            rotationSnap: 15,
            shortcuts: { ...defaultShortcuts }
        })

        localStorage.removeItem('editorSettings')
    }, [])

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    编辑器设置
                </h3>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center">
                        <Monitor className="h-4 w-4 mr-2" />
                        外观
                    </Label>
                    <Select
                        value={settings.theme}
                        onValueChange={(value: 'light' | 'dark' | 'system') => 
                            updateSettings('theme', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">浅色</SelectItem>
                            <SelectItem value="dark">深色</SelectItem>
                            <SelectItem value="system">跟随系统</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                    <Label className="flex items-center">
                        <MousePointer2 className="h-4 w-4 mr-2" />
                        交互
                    </Label>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>自动保存</Label>
                            <Switch
                                checked={settings.autoSave}
                                onCheckedChange={(checked) => 
                                    updateSettings('autoSave', checked)
                                }
                            />
                        </div>

                        {settings.autoSave && (
                            <div className="space-y-2">
                                <Label>保存间隔（分钟）</Label>
                                <Input
                                    type="number"
                                    value={settings.autoSaveInterval}
                                    onChange={(e) => 
                                        updateSettings('autoSaveInterval', Number(e.target.value))
                                    }
                                    min={1}
                                    max={60}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <Label className="flex items-center">
                        <Grid className="h-4 w-4 mr-2" />
                        网格与对齐
                    </Label>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>显示网格</Label>
                            <Switch
                                checked={settings.showGrid}
                                onCheckedChange={(checked) => 
                                    updateSettings('showGrid', checked)
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>对齐网格</Label>
                            <Switch
                                checked={settings.snapToGrid}
                                onCheckedChange={(checked) => 
                                    updateSettings('snapToGrid', checked)
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>网格大小</Label>
                            <Slider
                                value={[settings.gridSize]}
                                onValueChange={([value]) => 
                                    updateSettings('gridSize', value)
                                }
                                min={5}
                                max={100}
                                step={5}
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <Label className="flex items-center">
                        <Keyboard className="h-4 w-4 mr-2" />
                        快捷键
                    </Label>

                    <div className="space-y-2">
                        {Object.entries(settings.shortcuts).map(([action, shortcut]) => (
                            <div key={action} className="flex items-center justify-between">
                                <Label>{action}</Label>
                                <code className="px-2 py-1 rounded bg-accent">
                                    {shortcut}
                                </code>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Button
                variant="outline"
                className="w-full"
                onClick={resetSettings}
            >
                恢复默认设置
            </Button>
        </div>
    )
}