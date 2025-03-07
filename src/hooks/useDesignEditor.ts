import { useCallback, useState } from 'react'
import type { Canvas } from 'fabric'

interface UseDesignEditorOptions {
  onSave?: (canvas: Canvas) => void
  onChange?: () => void
}

export function useDesignEditor(options: UseDesignEditorOptions = {}) {
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [zoom, setZoom] = useState(100)

  // 保存历史记录
  const saveHistory = useCallback((canvas: Canvas) => {
    if (!canvas) return
    
    const json = canvas.toJSON()
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), JSON.stringify(json)]
      return newHistory.slice(-50) // 限制历史记录数量
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  // 撤销
  const undo = useCallback((canvas: Canvas) => {
    if (historyIndex <= 0 || !canvas) return
    
    const prevState = history[historyIndex - 1]
    if (prevState) {
      canvas.loadFromJSON(JSON.parse(prevState), () => {
        canvas.renderAll()
        setHistoryIndex(prev => prev - 1)
        options.onChange?.()
      })
    }
  }, [history, historyIndex, options])

  // 重做
  const redo = useCallback((canvas: Canvas) => {
    if (historyIndex >= history.length - 1 || !canvas) return
    
    const nextState = history[historyIndex + 1]
    if (nextState) {
      canvas.loadFromJSON(JSON.parse(nextState), () => {
        canvas.renderAll()
        setHistoryIndex(prev => prev + 1)
        options.onChange?.()
      })
    }
  }, [history, historyIndex, options])

  // 缩放控制
  const handleZoom = useCallback((canvas: Canvas, delta: number) => {
    if (!canvas) return
    
    const newZoom = Math.min(Math.max(25, zoom + delta), 400)
    const zoomRatio = newZoom / zoom
    
    canvas.setZoom(canvas.getZoom() * zoomRatio)
    setZoom(newZoom)
    canvas.renderAll()
  }, [zoom])

  return {
    history,
    historyIndex,
    zoom,
    saveHistory,
    undo,
    redo,
    handleZoom
  }
}