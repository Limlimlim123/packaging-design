'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Download, Share2, Copy, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useEditorStore } from '@/store/editor/editorStore'

interface ExportDialogProps {
    designId: string
}

export function ExportDialog({ designId }: ExportDialogProps) {
    const { canvas } = useEditorStore()
    const [format, setFormat] = useState('png')
    const [quality, setQuality] = useState(90)
    const [scale, setScale] = useState(1)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const { toast } = useToast()

    const shareUrl = `${window.location.origin}/designs/preview/${designId}`

    const handleExport = async () => {
        if (!canvas) return
        
        try {
            setLoading(true)
            const dataUrl = canvas.toDataURL({
                format: format as 'png' | 'jpeg' | 'svg',
                quality: quality / 100,
                multiplier: scale
            })
            
            // 创建下载链接
            const link = document.createElement('a')
            link.download = `design-${designId}.${format}`
            link.href = dataUrl
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast({
                description: '导出成功！'
            })
        } catch (error) {
            toast({
                title: '错误',
                description: '导出失败，请重试',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCopyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
            toast({
                description: '分享链接已复制！'
            })
        } catch (error) {
            toast({
                title: '错误',
                description: '复制失败，请手动复制',
                variant: 'destructive'
            })
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="space-x-2">
                    <Download className="h-4 w-4" />
                    <span>导出 / 分享</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>导出设计</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* 导出选项 */}
                    <div className="space-y-4">
                        <div>
                            <Label>导出格式</Label>
                            <RadioGroup
                                value={format}
                                onValueChange={setFormat}
                                className="flex space-x-4 mt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="png" id="png" />
                                    <Label htmlFor="png">PNG</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="jpeg" id="jpeg" />
                                    <Label htmlFor="jpeg">JPEG</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="svg" id="svg" />
                                    <Label htmlFor="svg">SVG</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {format !== 'svg' && (
                            <>
                                <div>
                                    <Label>质量 ({quality}%)</Label>
                                    <Slider
                                        value={[quality]}
                                        onValueChange={([value]) => setQuality(value)}
                                        min={10}
                                        max={100}
                                        step={1}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label>缩放 ({scale}x)</Label>
                                    <Slider
                                        value={[scale]}
                                        onValueChange={([value]) => setScale(value)}
                                        min={0.1}
                                        max={3}
                                        step={0.1}
                                        className="mt-2"
                                    />
                                </div>
                            </>
                        )}

                        <Button 
                            onClick={handleExport} 
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? '导出中...' : '导出'}
                        </Button>
                    </div>

                    <div className="border-t pt-4">
                        <Label className="flex items-center space-x-2">
                            <Share2 className="h-4 w-4" />
                            <span>分享链接</span>
                        </Label>
                        <div className="flex space-x-2 mt-2">
                            <Input 
                                value={shareUrl}
                                readOnly
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyShareLink}
                            >
                                {copied ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}