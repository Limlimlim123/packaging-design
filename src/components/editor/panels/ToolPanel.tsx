'use client'

import { useCallback } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useHotkeys } from 'react-hotkeys-hook'
import {
    MousePointer2,
    Hand,
    Square,
    Circle,
    Triangle,
    Type,
    Image as ImageIcon,
    Pen,
    Scissors,
    Eraser,
    Pipette,
    Ruler,
    Grid3X3
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tool = 
    | 'select'
    | 'pan'
    | 'rectangle'
    | 'circle'
    | 'triangle'
    | 'text'
    | 'image'
    | 'pen'
    | 'crop'
    | 'eraser'
    | 'eyedropper'
    | 'measure'
    | 'grid'

interface ToolButton {
    id: Tool
    icon: React.ReactNode
    label: string
    shortcut?: string
    disabled?: boolean
}

export function ToolPanel() {
    const { 
        canvas, 
        currentTool, 
        setCurrentTool,
        showGrid,
        setShowGrid,
        showGuides,
        setShowGuides
    } = useEditorStore()

    const tools: ToolButton[] = [
        { id: 'select', icon: <MousePointer2 />, label: '选择', shortcut: 'V' },
        { id: 'pan', icon: <Hand />, label: '平移', shortcut: 'H' },
        { id: 'rectangle', icon: <Square />, label: '矩形', shortcut: 'R' },
        { id: 'circle', icon: <Circle />, label: '圆形', shortcut: 'C' },
        { id: 'triangle', icon: <Triangle />, label: '三角形', shortcut: 'T' },
        { id: 'text', icon: <Type />, label: '文本', shortcut: 'T' },
        { id: 'image', icon: <ImageIcon />, label: '图片', shortcut: 'I' },
        { id: 'pen', icon: <Pen />, label: '钢笔', shortcut: 'P' },
        { id: 'crop', icon: <Scissors />, label: '裁剪', shortcut: 'X' },
        { id: 'eraser', icon: <Eraser />, label: '橡皮擦', shortcut: 'E' },
        { id: 'eyedropper', icon: <Pipette />, label: '吸管', shortcut: 'I' },
        { id: 'measure', icon: <Ruler />, label: '测量', shortcut: 'M' },
        { id: 'grid', icon: <Grid3X3 />, label: '网格', shortcut: 'G' }
    ]

    // 注册快捷键
    tools.forEach(tool => {
        if (tool.shortcut) {
            useHotkeys(tool.shortcut.toLowerCase(), () => {
                setCurrentTool(tool.id)
            })
        }
    })

    // 处理工具切换
    const handleToolChange = useCallback((toolId: Tool) => {
        if (!canvas) return

        setCurrentTool(toolId)

        // 重置画布状态
        canvas.isDrawingMode = toolId === 'pen'
        canvas.selection = toolId === 'select'

        // 特殊工具处理
        switch (toolId) {
            case 'grid':
                setShowGrid(!showGrid)
                break
            case 'measure':
                setShowGuides(!showGuides)
                break
            case 'pan':
                canvas.defaultCursor = 'grab'
                canvas.hoverCursor = 'grab'
                break
            default:
                canvas.defaultCursor = 'default'
                canvas.hoverCursor = 'pointer'
        }

        canvas.renderAll()
    }, [canvas, showGrid, showGuides])

    return (
        <div className="p-2 space-y-2">
            {tools.map((tool) => (
                <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                        <Button
                            variant={currentTool === tool.id ? 'default' : 'ghost'}
                            size="icon"
                            className={cn(
                                'w-10 h-10',
                                currentTool === tool.id && 'bg-primary text-primary-foreground',
                                tool.disabled && 'opacity-50 cursor-not-allowed'
                            )}
                            onClick={() => handleToolChange(tool.id)}
                            disabled={tool.disabled}
                        >
                            {tool.icon}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{tool.label}</p>
                        {tool.shortcut && (
                            <p className="text-xs text-muted-foreground">
                                快捷键: {tool.shortcut}
                            </p>
                        )}
                    </TooltipContent>
                </Tooltip>
            ))}
        </div>
    )
}