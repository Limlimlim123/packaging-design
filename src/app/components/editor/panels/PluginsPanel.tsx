'use client'

import { useCallback, useEffect, useState } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
    Puzzle,
    Search,
    Download,
    Settings,
    Star,
    DownloadCloud,
    RefreshCw,
    AlertCircle
} from 'lucide-react'

interface Plugin {
    id: string
    name: string
    description: string
    version: string
    author: string
    tags: string[]
    downloads: number
    rating: number
    installed: boolean
    enabled: boolean
    updateAvailable: boolean
    official: boolean
}

const plugins: Plugin[] = [
    {
        id: 'effects',
        name: '特效库',
        description: '提供丰富的图像特效和滤镜',
        version: '1.2.0',
        author: 'Official',
        tags: ['特效', '滤镜', '图像处理'],
        downloads: 10000,
        rating: 4.8,
        installed: true,
        enabled: true,
        updateAvailable: false,
        official: true
    },
    {
        id: 'export-plus',
        name: '导出增强',
        description: '支持更多导出格式和选项',
        version: '1.0.5',
        author: 'Community',
        tags: ['导出', '格式转换'],
        downloads: 5000,
        rating: 4.5,
        installed: true,
        enabled: false,
        updateAvailable: true,
        official: false
    },
    // ... 更多插件
]

export function PluginsPanel() {
    const { canvas } = useEditorStore()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [installedOnly, setInstalledOnly] = useState(false)
    const [loading, setLoading] = useState(false)

    const filteredPlugins = plugins.filter(plugin => {
        const matchesSearch = 
            plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return !installedOnly || plugin.installed ? matchesSearch : false
    })

    const togglePlugin = useCallback(async (plugin: Plugin) => {
        try {
            // 这里应该是实际的启用/禁用插件逻辑
            plugin.enabled = !plugin.enabled
            toast({
                title: plugin.enabled ? "插件已启用" : "插件已禁用",
                description: `${plugin.name} ${plugin.enabled ? '已启用' : '已禁用'}`,
            })
        } catch (error) {
            console.error('Failed to toggle plugin:', error)
            toast({
                title: "操作失败",
                description: "无法切换插件状态，请重试",
                variant: "destructive"
            })
        }
    }, [])

    const installPlugin = useCallback(async (plugin: Plugin) => {
        setLoading(true)
        try {
            // 这里应该是实际的安装插件逻辑
            await new Promise(resolve => setTimeout(resolve, 1000))
            plugin.installed = true
            plugin.enabled = true
            toast({
                title: "安装成功",
                description: `${plugin.name} 已安装并启用`
            })
        } catch (error) {
            console.error('Failed to install plugin:', error)
            toast({
                title: "安装失败",
                description: "无法安装插件，请重试",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [])

    const uninstallPlugin = useCallback(async (plugin: Plugin) => {
        setLoading(true)
        try {
            // 这里应该是实际的卸载插件逻辑
            await new Promise(resolve => setTimeout(resolve, 1000))
            plugin.installed = false
            plugin.enabled = false
            toast({
                title: "卸载成功",
                description: `${plugin.name} 已卸载`
            })
        } catch (error) {
            console.error('Failed to uninstall plugin:', error)
            toast({
                title: "卸载失败",
                description: "无法卸载插件，请重试",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [])

    const updatePlugin = useCallback(async (plugin: Plugin) => {
        setLoading(true)
        try {
            // 这里应该是实际的更新插件逻辑
            await new Promise(resolve => setTimeout(resolve, 1000))
            plugin.updateAvailable = false
            toast({
                title: "更新成功",
                description: `${plugin.name} 已更新到最新版本`
            })
        } catch (error) {
            console.error('Failed to update plugin:', error)
            toast({
                title: "更新失败",
                description: "无法更新插件，请重试",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [])

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                    <Puzzle className="h-4 w-4 mr-2" />
                    插件管理
                </h3>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索插件..."
                        className="pl-9"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                        checked={installedOnly}
                        onCheckedChange={setInstalledOnly}
                    />
                    <span className="text-sm">仅显示已安装</span>
                </div>
            </div>

            <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                    {filteredPlugins.map(plugin => (
                        <div
                            key={plugin.id}
                            className="p-4 rounded-lg border space-y-4"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-medium">
                                            {plugin.name}
                                        </h4>
                                        {plugin.official && (
                                            <Badge variant="secondary">
                                                官方
                                            </Badge>
                                        )}
                                        {plugin.updateAvailable && (
                                            <Badge variant="destructive">
                                                更新可用
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {plugin.description}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {plugin.installed ? (
                                        <>
                                            <Switch
                                                checked={plugin.enabled}
                                                onCheckedChange={() => togglePlugin(plugin)}
                                                disabled={loading}
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => uninstallPlugin(plugin)}
                                                disabled={loading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => installPlugin(plugin)}
                                            disabled={loading}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            安装
                                        </Button>
                                    )}
                                    {plugin.updateAvailable && (
                                        <Button
                                            variant="outline"
                                            onClick={() => updatePlugin(plugin)}
                                            disabled={loading}
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            更新
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div>版本: {plugin.version}</div>
                                <div>作者: {plugin.author}</div>
                                <div className="flex items-center">
                                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                                    {plugin.rating}
                                </div>
                                <div className="flex items-center">
                                    <DownloadCloud className="h-4 w-4 mr-1" />
                                    {plugin.downloads}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {plugin.tags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}