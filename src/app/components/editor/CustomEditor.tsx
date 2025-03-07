'use client'

import { useState, useRef } from 'react'
import { Canvas } from 'fabric/fabric-impl'
import { useToast } from '@/components/ui/use-toast'
import { LogoUploadPanel } from '@/components/editor/panels/LogoUploadPanel'
import { TextPanel } from '@/components/editor/panels/TextPanel'
import { PreviewCanvas } from '@/components/editor/PreviewCanvas'
import { TouchHandler } from '@/components/editor/TouchHandler'
import { RenderOptimizer } from '@/components/editor/RenderOptimizer'
import { ResizeHandler } from '@/components/editor/ResizeHandler'
import {
    Save,
    ZoomIn,
    ZoomOut,
} from 'lucide-react'

// 声明全局 fabric 变量
declare const fabric: any

export function CustomEditor() {
    const { toast } = useToast()
    const [zoom, setZoom] = useState(1)
    const [saving, setSaving] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const editorRef = useRef<Canvas | null>(null)

    // 处理画布就绪
    const handleCanvasReady = (canvas: Canvas) => {
        editorRef.current = canvas
        setIsReady(true)
        toast({
            description: '编辑器已就绪'
        })
    }

    // 处理保存
    const handleSave = async () => {
        if (!editorRef.current) return

        try {
            setSaving(true)
            // 实现保存逻辑
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast({
                description: '设计已保存'
            })
        } catch (error) {
            toast({
                description: '保存失败',
                variant: 'destructive'
            })
        } finally {
            setSaving(false)
        }
    }

    // 处理缩放
    const handleZoom = (delta: number) => {
        const newZoom = Math.min(Math.max(0.1, zoom + delta), 3)
        setZoom(newZoom)
        if (editorRef.current) {
            editorRef.current.setZoom(newZoom)
            editorRef.current.renderAll()
        }
    }

    return (
        <div className="h-screen flex flex-col">
            {/* 工具栏 */}
            <div className="h-16 border-b bg-white px-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-px h-6 bg-gray-200 mx-2" />
                    <button
                        onClick={() => handleZoom(0.1)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="放大"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={() => handleZoom(-0.1)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="缩小"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>保存设计</span>
                    </button>
                </div>
            </div>

            {/* 主编辑区 */}
            <div className="flex-1 flex">
                {/* 左侧工具面板 */}
                <div className="w-64 border-r bg-white">
                    <div className="p-4">
                        <TextPanel />
                        <LogoUploadPanel />
                    </div>
                </div>

                {/* 画布区域 */}
                <div className="flex-1 relative bg-gray-50">
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <PreviewCanvas 
                                width={800}
                                height={600}
                                className="border shadow-sm bg-white"
                                onReady={handleCanvasReady}
                            />
                            
                            {/* 加载状态 */}
                            {!isReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm text-gray-600">加载中...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 辅助组件 */}
                    {isReady && editorRef.current && (
                        <>
                            <TouchHandler canvas={editorRef.current} />
                            <RenderOptimizer canvas={editorRef.current} />
                            <ResizeHandler canvas={editorRef.current} />
                        </>
                    )}
                </div>
            </div>

            {/* 保存提示 */}
            {saving && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span>正在保存设计...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}