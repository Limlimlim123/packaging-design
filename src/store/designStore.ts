import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { DesignItem, FilterOptions, DesignsResponse, ApiError, DesignSize, DesignMaterial } from '@/types/design'

interface DesignState {
  // 状态
  designs: DesignItem[]
  currentDesign: DesignItem | null
  selectedSize: DesignSize | null
  selectedMaterial: DesignMaterial | null
  quantity: number
  loading: boolean
  error: ApiError | null
  filters: FilterOptions
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  
  // 操作方法
  setFilters: (filters: Partial<FilterOptions>) => void
  resetFilters: () => void
  fetchDesigns: () => Promise<void>
  fetchMoreDesigns: () => Promise<void>
  selectDesign: (design: DesignItem) => void
  selectSize: (size: DesignSize | null) => void
  selectMaterial: (material: DesignMaterial | null) => void
  setQuantity: (quantity: number) => void
  clearDesign: () => void
  calculatePrice: () => number
}

const initialFilters: FilterOptions = {
  page: 1,
  pageSize: 12,
  sortBy: 'newest'
}

export const useDesignStore = create<DesignState>()(
  devtools((set, get) => ({
    // 初始状态
    designs: [],
    currentDesign: null,
    selectedSize: null,
    selectedMaterial: null,
    quantity: 100,
    loading: false,
    error: null,
    filters: initialFilters,
    pagination: {
      page: 1,
      pageSize: 12,
      total: 0,
      totalPages: 0
    },

    // 设置筛选条件
    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters, page: 1 },
        designs: []
      }))
      get().fetchDesigns()
    },

    // 重置筛选条件
    resetFilters: () => {
      set(() => ({
        filters: initialFilters,
        designs: []
      }))
      get().fetchDesigns()
    },

    // 获取设计列表
    fetchDesigns: async () => {
      const { filters } = get()
      set({ loading: true, error: null })

      try {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString())
        })

        const response = await fetch(`/api/designs?${params}`)
        const data: DesignsResponse = await response.json()

        if (!response.ok) throw data

        set({
          designs: data.designs,
          pagination: {
            page: data.page,
            pageSize: data.pageSize,
            total: data.total,
            totalPages: data.totalPages
          },
          loading: false
        })
      } catch (error) {
        set({ 
          error: {
            code: 'FETCH_ERROR',
            message: '获取设计列表失败',
            details: error
          },
          loading: false 
        })
      }
    },

    // 加载更多设计
    fetchMoreDesigns: async () => {
      const { filters, loading, pagination } = get()
      if (loading || pagination.page >= pagination.totalPages) return

      set({ loading: true })

      try {
        const nextPage = pagination.page + 1
        const params = new URLSearchParams({
          ...filters,
          page: nextPage.toString()
        })

        const response = await fetch(`/api/designs?${params}`)
        const data: DesignsResponse = await response.json()

        if (!response.ok) throw data

        set((state) => ({
          designs: [...state.designs, ...data.designs],
          pagination: {
            ...state.pagination,
            page: nextPage
          },
          loading: false
        }))
      } catch (error) {
        set({ 
          error: {
            code: 'FETCH_ERROR',
            message: '加载更多设计失败',
            details: error
          },
          loading: false 
        })
      }
    },

    // 选择当前设计
    selectDesign: (design) => {
      set({ 
        currentDesign: design,
        selectedSize: null,
        selectedMaterial: null,
        quantity: 100
      })
    },

    // 选择尺寸
    selectSize: (size) => {
      set({ selectedSize: size })
    },

    // 选择材质
    selectMaterial: (material) => {
      set({ selectedMaterial: material })
    },

    // 设置数量
    setQuantity: (quantity) => {
      set({ quantity: Math.max(1, quantity) })
    },

    // 清除当前设计
    clearDesign: () => {
      set({ 
        currentDesign: null,
        selectedSize: null,
        selectedMaterial: null,
        quantity: 100
      })
    },

    // 计算价格
    calculatePrice: () => {
      const { currentDesign, selectedSize, selectedMaterial, quantity } = get()
      if (!currentDesign) return 0

      let total = currentDesign.price.base
      
      // 添加尺寸差价
      if (selectedSize?.price) {
        total += selectedSize.price
      }

      // 添加材质差价
      if (selectedMaterial?.price) {
        total += selectedMaterial.price
      }

      // 批量折扣
      const bulkPrices = currentDesign.price.bulk || []
      const discount = bulkPrices
        .filter(b => quantity >= b.quantity)
        .sort((a, b) => b.quantity - a.quantity)[0]?.discount || 1

      return total * quantity * discount
    }
  }))
)