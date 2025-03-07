'use client'

import { useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
    Package,
    Save,
    Folder,
    Plus,
    Edit2,
    Trash2,
    Download,
    Upload
} from 'lucide-react'

interface Preset {
    id: string
    name: string
    category: string
    thumbnail: string
    data: string // JSON string
}

const defaultCategories = ['常用', '包装', '标签', '海报', '自定义']

export function PresetPanel() {
    const { canvas, addHistoryEntry } = useEditorStore()
    const [presets, setPresets] = useState<Preset[]>([])
    const [selectedCategory, setSelectedCategory] = useState('常用')
    const [newPresetName, setNewPresetName] = useState('')
    const [editingPreset, setEditingPreset] = useState<Preset | null>(null)

    const savePreset = useCallback(async () => {
        if (!canvas || !newPresetName) return

        try {
            const json = JSON.stringify(canvas.toJSON(['id', 'name']))
            const thumbnail = canvas.toDataURL({
                format: 'png',
                quality: 0.8,
                multiplier: 0.5
            })

            const newPreset: Preset = {
                id: Date.now().toString(),
                name: newPresetName,
                category: selectedCategory,
                thumbnail,
                data: json
            }

            setPresets(prev => [...prev, newPreset])
            setNewPresetName('')

            // 保存到本地存储
            const savedPresets = JSON.parse(localStorage.getItem('presets') || '[]')
            savedPresets.push(newPreset)
            localStorage.setItem('presets', JSON.stringify(savedPresets))
        } catch (error) {
            console.error('Failed to save preset:', error)
        }
    }, [canvas, newPresetName, selectedCategory])

    const loadPreset = useCallback((preset: Preset) => {
        if (!canvas) return

        try {
            canvas.loadFromJSON(preset.data, () => {
                canvas.renderAll()
                addHistoryEntry()
            })
        } catch (error) {
            console.error('Failed to load preset:', error)
        }
    }, [canvas])

    const deletePreset = useCallback((presetId: string) => {
        setPresets(prev => prev.filter(p => p.id !== presetId))
        
        // 更新本地存储
        const savedPresets = JSON.parse(localStorage.getItem('presets') || '[]')
        localStorage.setItem('presets', JSON.stringify(
            savedPresets.filter((p: Preset) => p.id !== presetId)
        ))
    }, [])

    const exportPresets = useCallback(() => {
        const data = JSON.stringify(presets)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'presets.json'
        a.click()
        URL.revokeObjectURL(url)
    }, [presets])

    const importPresets = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const importedPresets = JSON.parse(event.target?.result as string)
                setPresets(prev => [...prev, ...importedPresets])
                localStorage.setItem('presets', JSON.stringify([...presets, ...importedPresets]))
            } catch (error) {
                console.error('Failed to import presets:', error)
            }
        }
        reader.readAsText(file)
    }, [presets])

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    预设管理
                </h3>
                <div className="flex space-x-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>保存预设</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>预设名称</Label>
                                    <Input
                                        value={newPresetName}
                                        onChange={(e) => setNewPresetName(e.target.value)}
                                        placeholder="输入预设名称"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>分类</Label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full"
                                    >
                                        {defaultCategories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button onClick={savePreset} disabled={!newPresetName}>
                                    <Save className="h-4 w-4 mr-2" />
                                    保存
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="icon" onClick={exportPresets}>
                        <Download className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => document.getElementById('import-presets')?.click()}
                    >
                        <Upload className="h-4 w-4" />
                    </Button>
                    <input
                        id="import-presets"
                        type="file"
                        accept=".json"
                        onChange={importPresets}
                        className="hidden"
                    />
                </div>
            </div>

            <Tabs defaultValue="常用">
                <TabsList className="w-full">
                    {defaultCategories.map(category => (
                        <TabsTrigger
                            key={category}
                            value={category}
                            className="flex-1"
                        >
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {defaultCategories.map(category => (
                    <TabsContent key={category} value={category}>
                        <ScrollArea className="h-[400px]">
                            <div className="grid grid-cols-2 gap-4">
                                {presets
                                    .filter(preset => preset.category === category)
                                    .map(preset => (
                                        <div
                                            key={preset.id}
                                            className="relative group"
                                        >
                                            <img
                                                src={preset.thumbnail}
                                                alt={preset.name}
                                                className="w-full aspect-video object-cover rounded-lg cursor-pointer"
                                                onClick={() => loadPreset(preset)}
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingPreset(preset)}
                                                >
                                                    <Edit2 className="h-4 w-4 text-white" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deletePreset(preset.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-white" />
                                                </Button>
                                            </div>
                                            <div className="mt-2 text-sm font-medium">
                                                {preset.name}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}