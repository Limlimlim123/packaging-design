import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TemplateSize {
  id: string
  name: string
  width: number
  height: number
  description: string
}

interface Template {
  id: string
  name: string
  category: string
  size: {
    width: number
    height: number
    name: string
  }
  preview: string
  background: string
  isActive: boolean
  createdAt: string
}

interface BrowseTemplateStore {
  // 状态
  templates: Template[]
  recentTemplates: Template[]
  selectedTemplate: Template | null
  selectedSize: TemplateSize | null
  loading: boolean
  error: string | null

  // 动作
  setTemplates: (templates: Template[]) => void
  setSelectedTemplate: (template: Template | null) => void
  setSelectedSize: (size: TemplateSize | null) => void
  addRecentTemplate: (template: Template) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // 异步操作
  fetchTemplates: (category?: string, size?: string) => Promise<void>
  fetchTemplateById: (id: string) => Promise<void>
}

export const useBrowseTemplateStore = create<BrowseTemplateStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      templates: [],
      recentTemplates: [],
      selectedTemplate: null,
      selectedSize: null,
      loading: false,
      error: null,

      // 基础动作
      setTemplates: (templates) => set({ templates }),
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),
      setSelectedSize: (size) => set({ selectedSize: size }),
      
      addRecentTemplate: (template) => {
        set((state) => ({
          recentTemplates: [
            template,
            ...state.recentTemplates.filter((t) => t.id !== template.id)
          ].slice(0, 10) // 只保留最近10个
        }))
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // 异步操作
      fetchTemplates: async (category, size) => {
        const { setLoading, setError, setTemplates } = get()
        try {
          setLoading(true)
          setError(null)
          const params = new URLSearchParams()
          if (category) params.append('category', category)
          if (size) params.append('size', size)
          
          const response = await fetch(`/api/templates/list?${params}`)
          if (!response.ok) throw new Error('Failed to fetch templates')
          
          const data = await response.json()
          setTemplates(data)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error')
        } finally {
          setLoading(false)
        }
      },

      fetchTemplateById: async (id) => {
        const { setLoading, setError, setSelectedTemplate, addRecentTemplate } = get()
        try {
          setLoading(true)
          setError(null)
          
          const response = await fetch(`/api/templates/${id}`)
          if (!response.ok) throw new Error('Template not found')
          
          const template = await response.json()
          setSelectedTemplate(template)
          addRecentTemplate(template)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error')
        } finally {
          setLoading(false)
        }
      }
    }),
    {
      name: 'browse-template-store',
      partialize: (state) => ({
        recentTemplates: state.recentTemplates,
        selectedSize: state.selectedSize
      })
    }
  )
)