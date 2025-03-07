import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface TemplateStore {
  templates: Template[]
  recentTemplates: Template[]
  selectedTemplate: Template | null
  loading: boolean
  error: string | null
  // 动作
  setTemplates: (templates: Template[]) => void
  setSelectedTemplate: (template: Template | null) => void
  addRecentTemplate: (template: Template) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchTemplates: (category?: string, size?: string) => Promise<void>
  fetchTemplateById: (id: string) => Promise<void>
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],
      recentTemplates: [],
      selectedTemplate: null,
      loading: false,
      error: null,

      setTemplates: (templates) => set({ templates }),
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),
      
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

      fetchTemplates: async (category, size) => {
        const { setLoading, setError, setTemplates } = get()
        try {
          setLoading(true)
          setError(null)
          const params = new URLSearchParams()
          if (category) params.append('category', category)
          if (size) params.append('size', size)
          
          const response = await fetch(`/api/templates?${params}`)
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
      name: 'template-store',
      partialize: (state) => ({
        recentTemplates: state.recentTemplates
      })
    }
  )
)