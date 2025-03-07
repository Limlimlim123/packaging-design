import { useEffect, useCallback } from 'react'
import type { Canvas } from 'fabric'

interface UseKeyboardShortcutsOptions {
  onUndo?: () => void
  onRedo?: () => void
  onDelete?: () => void
  onCopy?: () => void
  onPaste?: () => void
  onSave?: () => void
}

export function useKeyboardShortcuts(
  canvas: Canvas | null,
  options: UseKeyboardShortcutsOptions = {}
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!canvas) return

    // 检查是否在输入框中
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    // Ctrl/Cmd + Z - 撤销
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      options.onUndo?.()
    }

    // Ctrl/Cmd + Shift + Z - 重做
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault()
      options.onRedo?.()
    }

    // Delete - 删除选中对象
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      options.onDelete?.()
    }

    // Ctrl/Cmd + C - 复制
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault()
      options.onCopy?.()
    }

    // Ctrl/Cmd + V - 粘贴
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      e.preventDefault()
      options.onPaste?.()
    }

    // Ctrl/Cmd + S - 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      options.onSave?.()
    }
  }, [canvas, options])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}