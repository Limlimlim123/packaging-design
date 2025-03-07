import { useState, useCallback } from 'react'
import type { Canvas } from 'fabric'

const MAX_HISTORY = 50

export function useCanvasHistory(canvas: Canvas | null) {
  const [history, setHistory] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  // 保存当前状态
  const saveState = useCallback(() => {
    if (!canvas) return

    const json = JSON.stringify(canvas.toJSON(['id', 'selectable', 'locked']))
    setHistory(prev => {
      const newHistory = [...prev.slice(0, currentIndex + 1), json]
      return newHistory.slice(-MAX_HISTORY) // 限制历史记录数量
    })
    setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [canvas, currentIndex])

  // 撤销
  const undo = useCallback(() => {
    if (!canvas || currentIndex <= 0) return

    const newIndex = currentIndex - 1
    const state = history[newIndex]
    
    if (state) {
      canvas.loadFromJSON(JSON.parse(state), () => {
        canvas.renderAll()
        setCurrentIndex(newIndex)
      })
    }
  }, [canvas, currentIndex, history])

  // 重做
  const redo = useCallback(() => {
    if (!canvas || currentIndex >= history.length - 1) return

    const newIndex = currentIndex + 1
    const state = history[newIndex]
    
    if (state) {
      canvas.loadFromJSON(JSON.parse(state), () => {
        canvas.renderAll()
        setCurrentIndex(newIndex)
      })
    }
  }, [canvas, currentIndex, history])

  // 清空历史
  const clearHistory = useCallback(() => {
    setHistory([])
    setCurrentIndex(-1)
  }, [])

  return {
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    saveState,
    undo,
    redo,
    clearHistory
  }
}