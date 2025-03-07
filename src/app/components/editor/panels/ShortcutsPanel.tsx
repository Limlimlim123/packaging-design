'use client'

import { useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/use-toast'
import {
    Download,
    Share2,
    Copy,
    FileImage,
    FilePdf,
    FileJson,
    Printer,
    Settings,
    Layers,
    Crop
} from 'lucide-react'

interface ExportSettings {
    format: 'png' | 'jpeg' | 'svg' | 'pdf' | 'json'
    quality: number
    scale: number
    width: number
    height: number
    unit: 'px' | 'mm' | 'cm' | 'in'
    dpi: number
    includeBackground: boolean
    selectedOnly: boolean
    cropToContent: boolean
    optimizeForWeb: boolean
}

export function ExportPanel() {
    const { canvas, addHistoryEntry } = useEditorStore()
    const { toast } = useToast()
    const [settings, setSettings] = useState<ExportSettings>({
        format: 'png',
        quality: 1,
        scale: 1,
        width: 800,
        height: 600,
        unit: 'px',
        dpi: 300,
        includeBackground: true,
        selectedOnly: false,
        cropToContent: false,
        optimizeForWeb: true
    })

    const handleExport = useCallback(async () => {
        if (!canvas) return

        try {
            let dataUrl: string | Blob
            const exportOptions: any = {
                format: settings.format,
                quality: settings.quality,
                multiplier: settings.scale,
                width: settings.width,
                height: settings.height
            }

            switch (settings.format) {
                case 'png':
                case 'jpeg':
                    dataUrl = canvas.toDataURL({
                        ...exportOptions,
                        enableRetinaScaling: true,
                        withoutTransform: false
                    })
                    break

                case 'svg':
                    dataUrl = canvas.toSVG()
                    break

                case 'pdf':
                    // PDF导出需要额外的库支持
                    const pdf = new window.jsPDF({
                        orientation: settings.width > settings.height ? 'landscape' : 'portrait',
                        unit: settings.unit,
                        format: [settings.width, settings.height]
                    })
                    
                    const imgData = canvas.toDataURL({
                        format: 'jpeg',
                        quality: 1
                    })
                    
                    pdf.addImage(imgData, 'JPEG', 0, 0, settings.width, settings.height)
                    dataUrl = pdf.output('blob')
                    break

                case 'json':
                    dataUrl = new Blob(
                        [JSON.stringify(canvas.toJSON(['id', 'name']))],
                        { type: 'application/json' }
                    )
                    break

                default:
                    throw new Error('不支持的导出格式')
            }

            // 创建下载链接
            const link = document.createElement('a')
            link.href = dataUrl instanceof Blob ? URL.createObjectURL(dataUrl) : dataUrl
            link.download = `export.${settings.format}`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            if (dataUrl instanceof Blob) {
                URL.revokeObjectURL(link.href)
            }

            toast({
                title: "导出成功",
                description: `已导出为 ${settings.format.toUpperCase()} 格式`
            })
        } catch (error) {
            console.error('Export failed:', error)
            toast({
                title: "导出失败",
                description: "请重试或选择其他格式",
                variant: "destructive"
            })
        }
    }, [canvas, settings])

    const handleShare = useCallback(async () => {
        if (!canvas) return

        try {
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob as Blob)
                })
            })

            if (navigator.share) {
                await navigator.share({
                    files: [new File([blob], 'share.png', { type: 'image/png' })]
                })
            } else if (navigator.clipboard) {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ])
                toast({
                    title: "已复制到剪贴板",
                    description: "图片已复制，可以直接粘贴使用"
                })
            }
        } catch (error) {
            console.error('Share failed:', error)
            toast({
                title: "分享失败",
                description: "请重试或手动保存图片",
                variant: "destructive"
            })
        }
    }, [canvas])

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    导出设置
                </h3>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShare}
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.print()}
                    >
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>导出格式</Label>
                    <Select
                        value={settings.format}
                        onValueChange={(value: ExportSettings['format']) => 
                            setSettings(prev => ({ ...prev, format: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="png">
                                <div className="flex items-center">
                                    <FileImage className="h-4 w-4 mr-2" />
                                    PNG
                                </div>
                            </SelectItem>
                            <SelectItem value="jpeg">
                                <div className="flex items-center">
                                    <FileImage className="h-4 w-4 mr-2" />
                                    JPEG
                                </div>
                            </SelectItem>
                            <SelectItem value="svg">
                                <div className="flex items-center">
                                    <FileImage className="h-4 w-4 mr-2" />
                                    SVG
                                </div>
                            </SelectItem>
                            <SelectItem value="pdf">
                                <div className="flex items-center">
                                    <FilePdf className="h-4 w-4 mr-2" />
                                    PDF
                                </div>
                            </SelectItem>
                            <SelectItem value="json">
                                <div className="flex items-center">
                                    <FileJson className="h-4 w-4 mr-2" />
                                    JSON
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {(settings.format === 'png' || settings.format === 'jpeg') && (
                    <div className="space-y-2">
                        <Label>图片质量</Label>
                        <Slider
                            value={[settings.quality]}
                            onValueChange={([value]) => 
                                setSettings(prev => ({ ...prev, quality: value }))
                            }
                            min={0.1}
                            max={1}
                            step={0.1}
                        />
                        <div className="text-xs text-right text-muted-foreground">
                            {Math.round(settings.quality * 100)}%
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>导出尺寸</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs">宽度</Label>
                            <Input
                                type="number"
                                value={settings.width}
                                onChange={(e) => 
                                    setSettings(prev => ({ 
                                        ...prev, 
                                        width: Number(e.target.value) 
                                    }))
                                }
                                min={1}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">高度</Label>
                            <Input
                                type="number"
                                value={settings.height}
                                onChange={(e) => 
                                    setSettings(prev => ({ 
                                        ...prev, 
                                        height: Number(e.target.value) 
                                    }))
                                }
                                min={1}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        高级选项
                    </Label>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>包含背景</Label>
                            <Switch
                                checked={settings.includeBackground}
                                onCheckedChange={(checked) => 
                                    setSettings(prev => ({ 
                                        ...prev, 
                                        includeBackground: checked 
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>仅导出选中</Label>
                            <Switch
                                checked={settings.selectedOnly}
                                onCheckedChange={(checked) => 
                                    setSettings(prev => ({ 
                                        ...prev, 
                                        selectedOnly: checked 
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>裁剪内容</Label>
                            <Switch
                                checked={settings.cropToContent}
                                onCheckedChange={(checked) => 
                                    setSettings(prev => ({ 
                                        ...prev, 
                                        cropToContent: checked 
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>优化网页</Label>
                            <Switch
                                checked={settings.optimizeForWeb}
                                onCheckedChange={(checked) => 
                                    setSettings(prev => ({ 
                                        ...prev, 
                                        optimizeForWeb: checked 
                                    }))
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Button
                className="w-full"
                onClick={handleExport}
            >
                <Download className="h-4 w-4 mr-2" />
                导出
            </Button>
        </div>
    )
}