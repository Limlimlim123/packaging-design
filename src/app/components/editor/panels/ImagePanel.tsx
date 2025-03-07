'use client'

import { useCallback, useState } from 'react'
import { fabric } from 'fabric'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
    Upload,
    Link,
    Image as ImageIcon,
    Crop,
    RotateCw,
    FlipHorizontal,
    FlipVertical,
    SlidersHorizontal
} from 'lucide-react'

export function ImagePanel() {
    const { canvas, addToHistory } = useEditorStore()
    const { toast } = useToast()
    const [imageUrl, setImageUrl] = useState('')
    const [uploading, setUploading] = useState(false)
    const [filters, setFilters] = useState({
        brightness: 0,
        contrast: 0,
        saturation: 0,
        blur: 0
    })

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canvas || !e.target.files?.[0]) return

        try {
            setUploading(true)
            const file = e.target.files[0]
            const reader = new FileReader()

            reader.onload = (event) => {
                fabric.Image.fromURL(event.target?.result as string, (img) => {
                    // 调整图片大小以适应画布
                    const scale = Math.min(
                        (canvas.width! - 100) / img.width!,
                        (canvas.height! - 100) / img.height!,
                        1
                    )
                    
                    img.scale(scale)
                    img.set({
                        left: 50,
                        top: 50
                    })

                    canvas.add(img)
                    canvas.setActiveObject(img)
                    addToHistory()
                    canvas.renderAll()
                })
            }

            reader.readAsDataURL(file)
            toast({
                title: "上传成功",
                description: "图片已添加到画布"
            })
        } catch (error) {
            console.error('Upload failed:', error)
            toast({
                title: "上传失败",
                description: "请重试或尝试其他图片",
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }, [canvas, addToHistory])

    const handleUrlImage = useCallback(async () => {
        if (!canvas || !imageUrl) return

        try {
            setUploading(true)
            fabric.Image.fromURL(imageUrl, (img) => {
                const scale = Math.min(
                    (canvas.width! - 100) / img.width!,
                    (canvas.height! - 100) / img.height!,
                    1
                )
                
                img.scale(scale)
                img.set({
                    left: 50,
                    top: 50
                })

                canvas.add(img)
                canvas.setActiveObject(img)
                addToHistory()
                canvas.renderAll()
                setImageUrl('')
            }, (err) => {
                throw err
            })
        } catch (error) {
            console.error('URL image failed:', error)
            toast({
                title: "添加失败",
                description: "无法加载图片，请检查URL是否有效",
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }, [canvas, imageUrl, addToHistory])

    const updateImageFilters = useCallback(() => {
        if (!canvas) return

        const activeObject = canvas.getActiveObject()
        if (!activeObject || !activeObject.isType('image')) return

        try {
            const img = activeObject as fabric.Image
            img.filters = []

            if (filters.brightness !== 0) {
                img.filters.push(new fabric.Image.filters.Brightness({
                    brightness: filters.brightness
                }))
            }

            if (filters.contrast !== 0) {
                img.filters.push(new fabric.Image.filters.Contrast({
                    contrast: filters.contrast
                }))
            }

            if (filters.saturation !== 0) {
                img.filters.push(new fabric.Image.filters.Saturation({
                    saturation: filters.saturation
                }))
            }

            if (filters.blur !== 0) {
                img.filters.push(new fabric.Image.filters.Blur({
                    blur: filters.blur
                }))
            }

            img.applyFilters()
            canvas.renderAll()
            addToHistory()
        } catch (error) {
            console.error('更新图片滤镜失败:', error)
            toast({
                title: "更新失败",
                description: "无法应用滤镜，请重试",
                variant: "destructive"
            })
        }
    }, [canvas, filters, addToHistory])

    return (
        <div className="space-y-4 p-4">
            <Tabs defaultValue="upload">
                <TabsList className="w-full">
                    <TabsTrigger value="upload" className="flex-1">
                        <Upload className="w-4 h-4 mr-2" />
                        上传
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex-1">
                        <Link className="w-4 h-4 mr-2" />
                        链接
                    </TabsTrigger>
                    <TabsTrigger value="edit" className="flex-1">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        编辑
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                    <div>
                        <Label>从本地上传</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="mt-2"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                    <div>
                        <Label>图片链接</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                type="url"
                                placeholder="输入图片URL..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                disabled={uploading}
                            />
                            <Button
                                onClick={handleUrlImage}
                                disabled={uploading || !imageUrl}
                            >
                                添加
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="edit" className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => {
                            const activeObject = canvas?.getActiveObject()
                            if (activeObject?.isType('image')) {
                                activeObject.rotate((activeObject.angle || 0) + 90)
                                canvas?.renderAll()
                                addToHistory()
                            }
                        }}>
                            <RotateCw className="h-4 w-4 mr-2" />
                            旋转90°
                        </Button>
                        <Button variant="outline" onClick={() => {
                            const activeObject = canvas?.getActiveObject()
                            if (activeObject?.isType('image')) {
                                activeObject.set('flipX', !activeObject.flipX)
                                canvas?.renderAll()
                                addToHistory()
                            }
                        }}>
                            <FlipHorizontal className="h-4 w-4 mr-2" />
                            水平翻转
                        </Button>
                        <Button variant="outline" onClick={() => {
                            const activeObject = canvas?.getActiveObject()
                            if (activeObject?.isType('image')) {
                                activeObject.set('flipY', !activeObject.flipY)
                                canvas?.renderAll()
                                addToHistory()
                            }
                        }}>
                            <FlipVertical className="h-4 w-4 mr-2" />
                            垂直翻转
                        </Button>
                        <Button variant="outline" onClick={() => {
                            toast({
                                description: "裁剪功能开发中"
                            })
                        }}>
                            <Crop className="h-4 w-4 mr-2" />
                            裁剪
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <Label className="flex items-center">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            图片调整
                        </Label>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>亮度</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {filters.brightness}
                                    </span>
                                </div>
                                <Slider
                                    value={[filters.brightness]}
                                    onValueChange={([value]) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            brightness: value
                                        }))
                                        updateImageFilters()
                                    }}
                                    min={-1}
                                    max={1}
                                    step={0.1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>对比度</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {filters.contrast}
                                    </span>
                                </div>
                                <Slider
                                    value={[filters.contrast]}
                                    onValueChange={([value]) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            contrast: value
                                        }))
                                        updateImageFilters()
                                    }}
                                    min={-1}
                                    max={1}
                                    step={0.1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>饱和度</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {filters.saturation}
                                    </span>
                                </div>
                                <Slider
                                    value={[filters.saturation]}
                                    onValueChange={([value]) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            saturation: value
                                        }))
                                        updateImageFilters()
                                    }}
                                    min={-1}
                                    max={1}
                                    step={0.1}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>模糊</Label>
                                    <span className="text-xs text-muted-foreground">
                                        {filters.blur}
                                    </span>
                                </div>
                                <Slider
                                    value={[filters.blur]}
                                    onValueChange={([value]) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            blur: value
                                        }))
                                        updateImageFilters()
                                    }}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}