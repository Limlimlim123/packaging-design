'use client'

import { useCallback } from 'react'
import { useEditorStore } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    RotateCcw,
    RotateCw,
    History,
    CheckCircle2,
    XCircle,
    Image as ImageIcon,
    Type,
    Square,
    Trash2,
    Move,
    PaintBucket
} from 'lucide-react'

interface HistoryEntry {
    id: string
    type: string
    timestamp: number
    description: string
    name?: string
}

export function HistoryPanel() {
    const { 
        canvas,
        history,
        currentHistoryIndex,
        undo,
        redo,
        clearHistory,
        canUndo,
        canRedo
    } = useEditorStore()

    const handleUndo = useCallback(() => {
        if (!canvas) return
        undo()
    }, [canvas, undo])

    const handleRedo = useCallback(() => {
        if (!canvas) return
        redo()
    }, [canvas, redo])

    const restoreState = useCallback((index: number) => {
        if (!canvas || index === currentHistoryIndex) return

        if (index < currentHistoryIndex) {
            // 撤销到指定状态
            for (let i = 0; i < currentHistoryIndex - index; i++) {
                undo()
            }
        } else {
            // 重做到指定状态
            for (let i = 0; i < index - currentHistoryIndex; i++) {
                redo()
            }
        }
    }, [canvas, currentHistoryIndex, undo, redo])

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'add_image':
                return <ImageIcon className="h-4 w-4" />
            case 'add_text':
                return <Type className="h-4 w-4" />
            case 'add_shape':
                return <Square className="h-4 w-4" />
            case 'delete':
                return <Trash2 className="h-4 w-4" />
            case 'move':
                return <Move className="h-4 w-4" />
            case 'style':
                return <PaintBucket className="h-4 w-4" />
            case 'rotate':
                return <RotateCw className="h-4 w-4" />
            default:
                return <History className="h-4 w-4" />
        }
    }

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    历史记录
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleUndo}
                        disabled={!canUndo}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRedo}
                        disabled={!canRedo}
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                    {history.map((state: HistoryEntry, index) => (
                        <Button
                            key={state.id || index}
                            variant="ghost"
                            className={`w-full justify-start ${
                                index === currentHistoryIndex ? 'bg-primary/10' : ''
                            }`}
                            onClick={() => restoreState(index)}
                        >
                            {getActionIcon(state.type)}
                            <div className="ml-2 flex-1 text-left">
                                <div className="text-sm">
                                    {state.description || state.name || `状态 ${index + 1}`}
                                </div>
                                {state.timestamp && (
                                    <div className="text-xs opacity-70">
                                        {formatTime(state.timestamp)}
                                    </div>
                                )}
                            </div>
                            {index === currentHistoryIndex && (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                        </Button>
                    ))}
                </div>
            </ScrollArea>

            <Button
                variant="outline"
                className="w-full"
                onClick={clearHistory}
                disabled={history.length === 0}
            >
                <XCircle className="h-4 w-4 mr-2" />
                清除历史记录
            </Button>
        </div>
    )
}