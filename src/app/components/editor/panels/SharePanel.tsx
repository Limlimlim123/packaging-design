'use client'

import { useCallback, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import {
    Share2,
    Link,
    Copy,
    QrCode,
    Mail,
    Facebook,
    Twitter,
    Linkedin,
    Lock,
    Globe,
    Users,
    Calendar,
    Download,
    Eye
} from 'lucide-react'

interface ShareSettings {
    visibility: 'private' | 'public' | 'restricted'
    allowDownload: boolean
    allowCopy: boolean
    expiryDate: string | null
    password: string | null
    viewCount: number
    allowComments: boolean
}

export function SharePanel() {
    const { canvas } = useEditorStore()
    const { toast } = useToast()
    const [shareUrl, setShareUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState<ShareSettings>({
        visibility: 'private',
        allowDownload: false,
        allowCopy: false,
        expiryDate: null,
        password: null,
        viewCount: 0,
        allowComments: false
    })

    const generateShareUrl = useCallback(async () => {
        if (!canvas) return

        setLoading(true)
        try {
            // 这里应该是实际的生成分享链接的逻辑
            const data = canvas.toJSON(['id', 'name'])
            const response = await fetch('/api/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data,
                    settings
                })
            })

            if (!response.ok) throw new Error('Failed to generate share URL')

            const { url } = await response.json()
            setShareUrl(url)
            toast({
                title: "链接已生成",
                description: "分享链接已成功生成"
            })
        } catch (error) {
            console.error('Share failed:', error)
            toast({
                title: "生成失败",
                description: "无法生成分享链接，请重试",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [canvas, settings])

    const copyToClipboard = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            toast({
                title: "已复制",
                description: "链接已复制到剪贴板"
            })
        } catch (error) {
            console.error('Copy failed:', error)
            toast({
                title: "复制失败",
                description: "无法复制链接，请手动复制",
                variant: "destructive"
            })
        }
    }, [shareUrl])

    const shareToSocial = useCallback(async (platform: string) => {
        const text = '查看我的设计作品！'
        const url = encodeURIComponent(shareUrl)
        
        let shareUrl = ''
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
                break
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
                break
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
                break
            case 'email':
                shareUrl = `mailto:?subject=${text}&body=${url}`
                break
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank')
        }
    }, [shareUrl])

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                    <Share2 className="h-4 w-4 mr-2" />
                    分享设计
                </h3>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>可见性</Label>
                    <div className="flex space-x-2">
                        <Button
                            variant={settings.visibility === 'private' ? 'default' : 'outline'}
                            onClick={() => setSettings(prev => ({ ...prev, visibility: 'private' }))}
                            className="flex-1"
                        >
                            <Lock className="h-4 w-4 mr-2" />
                            私密
                        </Button>
                        <Button
                            variant={settings.visibility === 'restricted' ? 'default' : 'outline'}
                            onClick={() => setSettings(prev => ({ ...prev, visibility: 'restricted' }))}
                            className="flex-1"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            受限
                        </Button>
                        <Button
                            variant={settings.visibility === 'public' ? 'default' : 'outline'}
                            onClick={() => setSettings(prev => ({ ...prev, visibility: 'public' }))}
                            className="flex-1"
                        >
                            <Globe className="h-4 w-4 mr-2" />
                            公开
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>允许下载</Label>
                        <Switch
                            checked={settings.allowDownload}
                            onCheckedChange={(checked) => 
                                setSettings(prev => ({ ...prev, allowDownload: checked }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>允许复制</Label>
                        <Switch
                            checked={settings.allowCopy}
                            onCheckedChange={(checked) => 
                                setSettings(prev => ({ ...prev, allowCopy: checked }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>允许评论</Label>
                        <Switch
                            checked={settings.allowComments}
                            onCheckedChange={(checked) => 
                                setSettings(prev => ({ ...prev, allowComments: checked }))
                            }
                        />
                    </div>
                </div>

                {settings.visibility !== 'public' && (
                    <div className="space-y-2">
                        <Label>访问密码</Label>
                        <Input
                            type="password"
                            value={settings.password || ''}
                            onChange={(e) => 
                                setSettings(prev => ({ ...prev, password: e.target.value }))
                            }
                            placeholder="设置访问密码"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label>过期时间</Label>
                    <Input
                        type="datetime-local"
                        value={settings.expiryDate || ''}
                        onChange={(e) => 
                            setSettings(prev => ({ ...prev, expiryDate: e.target.value }))
                        }
                    />
                </div>
            </div>

            <Button
                className="w-full"
                onClick={generateShareUrl}
                disabled={loading}
            >
                <Link className="h-4 w-4 mr-2" />
                生成链接
            </Button>

            {shareUrl && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Input
                            value={shareUrl}
                            readOnly
                            className="flex-1"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                        >
                            <QrCode className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center justify-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => shareToSocial('email')}
                        >
                            <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => shareToSocial('facebook')}
                        >
                            <Facebook className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => shareToSocial('twitter')}
                        >
                            <Twitter className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => shareToSocial('linkedin')}
                        >
                            <Linkedin className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {settings.viewCount} 次查看
                        </div>
                        {settings.expiryDate && (
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                过期时间：{new Date(settings.expiryDate).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}