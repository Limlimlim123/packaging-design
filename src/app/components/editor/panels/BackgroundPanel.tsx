'use client'

import { useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ColorPicker } from '@/components/ui/color-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
    Image as ImageIcon,
    Palette,
    Gradient,
    Upload,
    Link,
    Eraser
} from 'lucide-react'
import { fabric } from 'fabric'

const gradientPresets = [
    { name: '日落', colors: ['#FF512F', '#F09819'] },
    { name: '海洋', colors: ['#2193b0', '#6dd5ed'] },
    { name: '紫罗兰', colors: ['#834d9b', '#d04ed6'] },
    { name: '青柠', colors: ['#56ab2f', '#a8e063'] },
    { name: '樱花', colors: ['#FF6B6B', '#FFE66D'] }
]

export function BackgroundPanel() {
    const { canvas, addToHistory } = useEditorStore()
    const { toast } = useToast()
    const [backgroundColor, setBackgroundColor] = useState('#ffffff')
    const [imageUrl, setImageUrl] = useState('')
    const [gradientAngle, setGradientAngle] = useState(90)
    const [gradientColors, setGradientColors] = useState(['#000000', '#ffffff'])

    const setBackground = useCallback((type: 'color' | 'image' | 'gradient', value: any) => {
        if (!canvas) return

        try {
            switch (type) {
                case 'color':
                    canvas.setBackgroundColor(value, () => {
                        canvas.renderAll()
                        addToHistory()
                    })
                    break

                case 'image':
                    fabric.Image.fromURL(value, (img) => {
                        canvas.setBackgroundImage(img, () => {
                            // 调整图片大小以适应画布
                            const canvasAspect = canvas.width! / canvas.height!
                            const imgAspect = img.width! / img.height!

                            if (canvasAspect > imgAspect) {
                                img.scaleToWidth(canvas.width!)
                            } else {
                                img.scaleToHeight(canvas.height!)
                            }

                            // 居中背景图片
                            img.center()
                            canvas.renderAll()
                            addToHistory()
                        }, {
                            crossOrigin: 'anonymous'
                        })
                    }, (err) => {
                        console.error('加载图片失败:', err)
                        toast({
                            title: "加载失败",
                            description: "无法加载图片，请检查URL是否有效",
                            variant: "destructive"
                        })
                    })
                    break

                case 'gradient':
                    const gradient = new fabric.Gradient({
                        type: 'linear',
                        coords: {
                            x1: 0,
                            y1: 0,
                            x2: Math.cos(gradientAngle * Math.PI / 180),
                            y2: Math.sin(gradientAngle * Math.PI / 180)
                        },
                        colorStops: [
                            { offset: 0, color: gradientColors[0] },
                            { offset: 1, color: gradientColors[1] }
                        ]
                    })

                    canvas.setBackgroundColor(gradient, () => {
                        canvas.renderAll()
                        addToHistory()
                    })
                    break
            }
        } catch (error) {
            console.error('设置背景失败:', error)
            toast({
                title: "设置失败",
                description: "无法设置背景，请重试",
                variant: "destructive"
            })
        }
    }, [canvas, gradientAngle, gradientColors])

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return

        try {
            const file = e.target.files[0]
            const reader = new FileReader()

            reader.onload = (event) => {
                if (event.target?.result) {
                    setBackground('image', event.target.result)
                }
            }

            reader.readAsDataURL(file)
        } catch (error) {
            console.error('上传图片失败:', error)
            toast({
                title: "上传失败",
                description: "无法上传图片，请重试",
                variant: "destructive"
            })
        }
    }, [setBackground])

    const clearBackground = useCallback(() => {
        if (!canvas) return

        try {
            canvas.setBackgroundColor('', () => {
                canvas.setBackgroundImage(null, () => {
                    canvas.renderAll()
                    addToHistory()
                })
            })
            toast({
                description: "已清除背景"
            })
        } catch (error) {
            console.error('清除背景失败:', error)
            toast({
                title: "清除失败",
                description: "无法清除背景，请重试",
                variant: "destructive"
            })
        }
    }, [canvas])

    return (
        <div className="p-4 space-y-4">
            <Tabs defaultValue="color">
                <TabsList className="w-full">
                    <TabsTrigger value="color" className="flex-1">
                        <Palette className="h-4 w-4 mr-2" />
                        纯色
                    </TabsTrigger>
                    <TabsTrigger value="gradient" className="flex-1">
                        <Gradient className="h-4 w-4 mr-2" />
                        渐变
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex-1">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        图片
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="color" className="space-y-4">
                    <div className="space-y-2">
                        <Label>背景颜色</Label>
                        <ColorPicker
                            color={backgroundColor}
                            onChange={(color) => {
                                setBackgroundColor(color)
                                setBackground('color', color)
                            }}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="gradient" className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>渐变预设</Label>
                            <ScrollArea className="h-[100px]">
                                <div className="grid grid-cols-2 gap-2">
                                    {gradientPresets.map((preset, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="h-12"
                                            style={{
                                                background: `linear-gradient(${gradientAngle}deg, ${preset.colors[0]}, ${preset.colors[1]})`
                                            }}
                                            onClick={() => {
                                                setGradientColors(preset.colors)
                                                setBackground('gradient', null)
                                            }}
                                        >
                                            <span className="sr-only">{preset.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="space-y-2">
                            <Label>渐变角度 ({gradientAngle}°)</Label>
                            <Slider
                                value={[gradientAngle]}
                                onValueChange={([value]) => {
                                    setGradientAngle(value)
                                    setBackground('gradient', null)
                                }}
                                min={0}
                                max={360}
                                step={1}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>起始颜色</Label>
                                <ColorPicker
                                    color={gradientColors[0]}
                                    onChange={(color) => {
                                        setGradientColors([color, gradientColors[1]])
                                        setBackground('gradient', null)
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>结束颜色</Label>
                                <ColorPicker
                                    color={gradientColors[1]}
                                    onChange={(color) => {
                                        setGradientColors([gradientColors[0], color])
                                        setBackground('gradient', null)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>上传图片</Label>
                            <div className="flex space-x-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                >
                                    <Upload className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>图片URL</Label>
                            <div className="flex space-x-2">
                                <Input
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="输入图片URL"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        if (imageUrl) {
                                            setBackground('image', imageUrl)
                                        }
                                    }}
                                >
                                    <Link className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <Button
                variant="outline"
                className="w-full"
                onClick={clearBackground}
            >
                <Eraser className="h-4 w-4 mr-2" />
                清除背景
            </Button>
        </div>
    )
}