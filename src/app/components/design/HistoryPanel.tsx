'use client'

import { useEditorStore, type HistoryEntry } from '@/store/editor/editorStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Undo2, 
  Redo2, 
  Image as ImageIcon, 
  Type, 
  Square,
  Trash2,
  Move,
  PaintBucket,
  RotateCw
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function HistoryPanel() {
  const { 
    history,
    currentHistoryIndex,
    undo,
    redo,
    canUndo,
    canRedo
  } = useEditorStore()

  const getActionIcon = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'add':
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
        return null
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="撤销"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="重做"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {history.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center space-x-2 p-2 rounded-lg ${
                index === currentHistoryIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary/80'
              }`}
            >
              {getActionIcon(entry.type)}
              <div className="flex-1">
                <div className="text-sm">{entry.description}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(entry.timestamp, {
                    addSuffix: true,
                    locale: zhCN
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}