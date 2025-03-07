import { fabric } from 'fabric'

export interface HistoryEntry {
  id: string
  state: string
  timestamp: number
  action: string
  description?: string
}

export interface EditorState {
  canvas: fabric.Canvas | null
  design: {
    id: string
    name: string
    width: number
    height: number
    elements: Element[]
  }
  history: {
    past: Element[][]
    future: Element[][]
  }
  addHistoryEntry: (action: Omit<HistoryEntry, 'id' | 'state' | 'timestamp'>) => void
  undo: () => void
  redo: () => void
}

export interface Element {
  id: string
  type: string
  properties: Record<string, unknown>
}

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'svg' | 'pdf' | 'json'
  quality: number
  scale: number
  width: number
  height: number
  unit: 'px' | 'mm' | 'cm' | 'in'
  dpi: number
  includeBackground: boolean
  selectedOnly: boolean
  cropToContent: boolean
  optimizeForWeb: boolean
}