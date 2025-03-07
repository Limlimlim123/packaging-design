import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Canvas } from 'fabric/fabric-impl'
import type { Object as FabricObject } from 'fabric/fabric-impl'
import type { Template } from '@/types/template'
import * as Fabric from 'fabric'

interface HistoryEntry {
  id: string
  type: 'initialize' | 'add' | 'add_image' | 'add_text' | 'add_shape' | 'delete' | 'move' | 'style' | 'rotate' | 'modify' | 'paste'
  description: string
  state: string // JSON string of canvas state
  timestamp: number
}

interface EditorState {
  // 画布状态
  canvas: Canvas | null
  setCanvas: (canvas: Canvas) => void
  activeObject: FabricObject | null
  setActiveObject: (object: FabricObject | null) => void
  copiedObject: FabricObject | null
  setCopiedObject: (object: FabricObject | null) => void
  backgroundColor: string
  setBackgroundColor: (color: string) => void
  width: number
  setWidth: (width: number) => void
  height: number
  setHeight: (height: number) => void
  
  // 设计相关
  designId: string | null
  setDesignId: (id: string) => void
  template: Template | null
  setTemplate: (template: Template) => void
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
  
  // 视图控制
  zoom: number
  setZoom: (zoom: number) => void
  showGrid: boolean
  setShowGrid: (show: boolean) => void
  showGuides: boolean
  setShowGuides: (show: boolean) => void
  activeTab: string
  setActiveTab: (tab: string) => void
  gridSize: number
  setGridSize: (size: number) => void
  snapThreshold: number
  setSnapThreshold: (threshold: number) => void
  
  // 历史记录
  history: HistoryEntry[]
  currentHistoryIndex: number
  canUndo: boolean
  canRedo: boolean
  addToHistory: (action: Omit<HistoryEntry, 'id' | 'state' | 'timestamp'>) => void
  undo: () => void
  redo: () => void
  clearHistory: () => void
  
  // 画布操作
  deleteActiveObject: () => void
  duplicateActiveObject: () => void
  alignObject: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  
  // 保存和导出
  saveDesign: () => Promise<void>
  saveSettings: () => Promise<void>
  exportDesign: (format: 'png' | 'jpg' | 'svg' | 'pdf') => Promise<string>
  loadDesign: (designId: string) => Promise<void>
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // 画布状态
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  activeObject: null,
  setActiveObject: (object) => set({ activeObject: object }),
  copiedObject: null,
  setCopiedObject: (object) => set({ copiedObject: object }),
  backgroundColor: '#ffffff',
  setBackgroundColor: (color) => {
    const { canvas } = get()
    if (!canvas) return
    
    canvas.setBackgroundColor(color, () => {
      canvas.renderAll()
      set({ backgroundColor: color })
      get().addToHistory({
        type: 'modify',
        description: '修改背景颜色'
      })
    })
  },
  width: 800,
  setWidth: (width) => {
    const { canvas } = get()
    if (!canvas) return
    
    canvas.setWidth(width)
    canvas.renderAll()
    set({ width })
    get().addToHistory({
      type: 'modify',
      description: '修改画布宽度'
    })
  },
  height: 600,
  setHeight: (height) => {
    const { canvas } = get()
    if (!canvas) return
    
    canvas.setHeight(height)
    canvas.renderAll()
    set({ height })
    get().addToHistory({
      type: 'modify',
      description: '修改画布高度'
    })
  },

  // 设计相关
  designId: null,
  setDesignId: (id) => set({ designId: id }),
  template: null,
  setTemplate: (template) => set({ template }),
  isDirty: false,
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  
  // 视图控制
  zoom: 1,
  setZoom: (zoom) => {
    const { canvas } = get()
    if (!canvas) return
    
    const newZoom = Math.min(Math.max(0.1, zoom), 3)
    canvas.setZoom(newZoom)
    canvas.renderAll()
    set({ zoom: newZoom })
  },
  showGrid: false,
  setShowGrid: (show) => set({ showGrid: show }),
  showGuides: false,
  setShowGuides: (show) => set({ showGuides: show }),
  activeTab: 'elements',
  setActiveTab: (tab) => set({ activeTab: tab }),
  gridSize: 20,
  setGridSize: (size) => set({ gridSize: size }),
  snapThreshold: 5,
  setSnapThreshold: (threshold) => set({ snapThreshold: threshold }),
  
  // 历史记录
  history: [],
  currentHistoryIndex: -1,
  canUndo: false,
  canRedo: false,
  
  addToHistory: (action) => {
    const { canvas, history, currentHistoryIndex } = get()
    if (!canvas) return

    const json = canvas.toJSON(['id', 'name', 'lockMovementX', 'lockMovementY', 'selectable'])
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      type: action.type,
      description: action.description,
      state: JSON.stringify(json),
      timestamp: Date.now()
    }
    
    const newHistory = history.slice(0, currentHistoryIndex + 1)
    newHistory.push(newEntry)
    
    set({
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
      isDirty: true
    })
  },

  undo: () => {
    const { canvas, history, currentHistoryIndex } = get()
    if (!canvas || currentHistoryIndex <= 0) return

    const newIndex = currentHistoryIndex - 1
    const entry = history[newIndex]
    canvas.loadFromJSON(JSON.parse(entry.state), () => {
      canvas.renderAll()
      set({
        currentHistoryIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true
      })
    })
  },

  redo: () => {
    const { canvas, history, currentHistoryIndex } = get()
    if (!canvas || currentHistoryIndex >= history.length - 1) return

    const newIndex = currentHistoryIndex + 1
    const entry = history[newIndex]
    canvas.loadFromJSON(JSON.parse(entry.state), () => {
      canvas.renderAll()
      set({
        currentHistoryIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < history.length - 1
      })
    })
  },

  clearHistory: () => {
    set({
      history: [],
      currentHistoryIndex: -1,
      canUndo: false,
      canRedo: false
    })
  },
  
  // 画布操作
  deleteActiveObject: () => {
    const { canvas } = get()
    if (!canvas) return
    
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.renderAll()
      get().addToHistory({
        type: 'delete',
        description: '删除对象'
      })
    }
  },

  duplicateActiveObject: () => {
    const { canvas } = get()
    if (!canvas) return
    
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      activeObject.clone((cloned: FabricObject) => {
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20
        })
        canvas.add(cloned)
        canvas.setActiveObject(cloned)
        canvas.renderAll()
        get().addToHistory({
          type: 'paste',
          description: '复制对象'
        })
      })
    }
  },

  alignObject: (direction) => {
    const { canvas } = get()
    if (!canvas) return
    
    const activeObject = canvas.getActiveObject()
    if (!activeObject) return

    switch (direction) {
      case 'left':
        activeObject.set('left', 0)
        break
      case 'center':
        activeObject.centerH()
        break
      case 'right':
        activeObject.set('left', canvas.width! - activeObject.width! * activeObject.scaleX!)
        break
      case 'top':
        activeObject.set('top', 0)
        break
      case 'middle':
        activeObject.centerV()
        break
      case 'bottom':
        activeObject.set('top', canvas.height! - activeObject.height! * activeObject.scaleY!)
        break
    }
    canvas.renderAll()
    get().addToHistory({
      type: 'move',
      description: `对齐对象到${direction}`
    })
  },
  
  // 保存和导出
  saveDesign: async () => {
    const { canvas, designId, template } = get()
    if (!canvas || !designId) return

    const json = canvas.toJSON(['id', 'name', 'lockMovementX', 'lockMovementY', 'selectable'])
    
    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: json,
          template: template
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save design')
      }
      
      set({ isDirty: false })
    } catch (error) {
      console.error('Save error:', error)
      throw error
    }
  },

  saveSettings: async () => {
    const { 
      designId,
      backgroundColor,
      width,
      height,
      gridSize,
      snapThreshold,
      showGrid,
      showGuides
    } = get()
    
    if (!designId) return

    try {
      const response = await fetch(`/api/designs/${designId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backgroundColor,
          width,
          height,
          gridSize,
          snapThreshold,
          showGrid,
          showGuides
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      throw error
    }
  },
  
  exportDesign: async (format) => {
    const { canvas } = get()
    if (!canvas) throw new Error('Canvas not initialized')

    return new Promise((resolve, reject) => {
      try {
        switch (format) {
          case 'png':
          case 'jpg':
            resolve(canvas.toDataURL({
              format,
              quality: 1,
              multiplier: 2
            }))
            break
          case 'svg':
            resolve(canvas.toSVG({
              suppressPreamble: false,
              viewBox: {
                x: 0,
                y: 0,
                width: canvas.width!,
                height: canvas.height!
              }
            }))
            break
          case 'pdf':
            reject(new Error('PDF export not implemented'))
            break
          default:
            reject(new Error('Unsupported format'))
        }
      } catch (error) {
        reject(error)
      }
    })
  },
  
  loadDesign: async (designId) => {
    const { canvas, setTemplate, clearHistory } = get()
    if (!canvas) return

    try {
      const response = await fetch(`/api/designs/${designId}`)
      if (!response.ok) {
        throw new Error('Failed to load design')
      }

      const data = await response.json()
      
      canvas.loadFromJSON(data.data, () => {
        canvas.renderAll()
        setTemplate(data.template)
        clearHistory()
        get().addToHistory({
          type: 'initialize',
          description: '加载设计'
        })
        set({
          designId,
          isDirty: false
        })
      })
    } catch (error) {
      console.error('Load error:', error)
      throw error
    }
  }
}))

export type { HistoryEntry }