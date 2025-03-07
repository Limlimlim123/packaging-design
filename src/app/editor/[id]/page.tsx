'use client'

import { EditorCanvas } from '@/components/editor/EditorCanvas'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { EditorSidebar } from '@/components/editor/EditorSidebar'
import { PreviewPanel } from '@/components/editor/PreviewPanel'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useEditorStore } from '@/store/editor/editorStore'
import { useEffect } from 'react'

export default function EditorPage() {
  const { initEditor, canvas } = useEditorStore()

  // 初始化编辑器
  useEffect(() => {
    initEditor()
  }, [initEditor])

  // 注册快捷键
  useHotkeys([
    ['ctrl+z', () => canvas?.undo()],
    ['ctrl+y', () => canvas?.redo()],
    ['ctrl+s', (e) => {
      e.preventDefault()
      canvas?.save()
    }],
    ['delete', () => canvas?.remove()],
    ['ctrl+c', () => canvas?.copy()],
    ['ctrl+v', () => canvas?.paste()],
    ['ctrl+x', () => canvas?.cut()],
  ])

  return (
    <div className="h-screen flex flex-col">
      <EditorToolbar />
      <div className="flex-1 flex">
        <EditorSidebar />
        <div className="flex-1 relative">
          <EditorCanvas />
        </div>
        <div className="w-80 border-l bg-white">
          <PreviewPanel />
        </div>
      </div>
    </div>
  )
}