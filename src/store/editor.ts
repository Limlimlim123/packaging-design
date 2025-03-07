import { create } from 'zustand'
import { nanoid } from 'nanoid'

export interface Element {
    id: string
    type: 'text' | 'image' | 'shape'
    x: number
    y: number
    width: number
    height: number
    rotation: number
    properties: {
        [key: string]: any
    }
}

interface EditorState {
    // 设计信息
    design: {
        id: string
        name: string
        width: number
        height: number
        elements: Element[]
    } | null
    // 选中的元素
    selectedElementIds: string[]
    // 历史记录
    history: {
        past: Element[][]
        future: Element[][]
    }
    // 缩放级别
    zoom: number
    // 画布位置
    pan: { x: number; y: number }
    
    // 操作方法
    initDesign: (design: any) => Promise<void>
    addElement: (element: Omit<Element, 'id'>) => void
    updateElement: (id: string, updates: Partial<Element>) => void
    deleteElement: (id: string) => void
    selectElements: (ids: string[]) => void
    clearSelection: () => void
    setZoom: (zoom: number) => void
    setPan: (pan: { x: number; y: number }) => void
    undo: () => void
    redo: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
    design: null,
    selectedElementIds: [],
    history: {
        past: [],
        future: []
    },
    zoom: 1,
    pan: { x: 0, y: 0 },

    initDesign: async (design) => {
        set({ design })
    },

    addElement: (element) => {
        const newElement = {
            ...element,
            id: nanoid()
        }

        set(state => {
            if (!state.design) return state

            const newElements = [...state.design.elements, newElement]
            
            return {
                design: {
                    ...state.design,
                    elements: newElements
                },
                history: {
                    past: [...state.history.past, state.design.elements],
                    future: []
                }
            }
        })
    },

    updateElement: (id, updates) => {
        set(state => {
            if (!state.design) return state

            const newElements = state.design.elements.map(element =>
                element.id === id ? { ...element, ...updates } : element
            )

            return {
                design: {
                    ...state.design,
                    elements: newElements
                },
                history: {
                    past: [...state.history.past, state.design.elements],
                    future: []
                }
            }
        })
    },

    deleteElement: (id) => {
        set(state => {
            if (!state.design) return state

            const newElements = state.design.elements.filter(
                element => element.id !== id
            )

            return {
                design: {
                    ...state.design,
                    elements: newElements
                },
                selectedElementIds: state.selectedElementIds.filter(
                    elementId => elementId !== id
                ),
                history: {
                    past: [...state.history.past, state.design.elements],
                    future: []
                }
            }
        })
    },

    selectElements: (ids) => {
        set({ selectedElementIds: ids })
    },

    clearSelection: () => {
        set({ selectedElementIds: [] })
    },

    setZoom: (zoom) => {
        set({ zoom })
    },

    setPan: (pan) => {
        set({ pan })
    },

    undo: () => {
        set(state => {
            if (state.history.past.length === 0 || !state.design) return state

            const previous = state.history.past[state.history.past.length - 1]
            const newPast = state.history.past.slice(0, -1)

            return {
                design: {
                    ...state.design,
                    elements: previous
                },
                history: {
                    past: newPast,
                    future: [state.design.elements, ...state.history.future]
                }
            }
        })
    },

    redo: () => {
        set(state => {
            if (state.history.future.length === 0 || !state.design) return state

            const next = state.history.future[0]
            const newFuture = state.history.future.slice(1)

            return {
                design: {
                    ...state.design,
                    elements: next
                },
                history: {
                    past: [...state.history.past, state.design.elements],
                    future: newFuture
                }
            }
        })
    }
}))