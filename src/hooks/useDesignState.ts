import { create } from 'zustand'

interface Size {
  id: string
  name: string
  width: number
  height: number
  depth?: number
  price?: number
}

interface Material {
  id: string
  name: string
  priceMultiplier: number
  description: string
}

interface Template {
  id: string
  name: string
  price: {
    base: number
  }
}

interface DesignState {
  selectedSize: Size | null
  selectedMaterial: Material | null
  quantity: number
  totalPrice: number
  errors: string[]
  isValid: boolean
  setSize: (size: Size) => void
  setMaterial: (material: Material) => void
  setQuantity: (quantity: number) => void
  updatePrice: (template: Template) => void
  reset: () => void
}

export const useDesignState = create<DesignState>((set, get) => ({
  selectedSize: null,
  selectedMaterial: null,
  quantity: 100,
  totalPrice: 0,
  errors: [],
  isValid: false,

  setSize: (size) => {
    set((state) => ({
      selectedSize: size,
      errors: state.errors.filter(e => e !== '请选择尺寸')
    }))
  },

  setMaterial: (material) => {
    set((state) => ({
      selectedMaterial: material,
      errors: state.errors.filter(e => e !== '请选择材质')
    }))
  },

  setQuantity: (quantity) => {
    set((state) => {
      const errors = state.errors.filter(e => e !== '请输入有效数量')
      if (quantity <= 0) {
        errors.push('请输入有效数量')
      }
      return {
        quantity,
        errors,
        isValid: errors.length === 0
      }
    })
  },

  updatePrice: (template) => {
    const state = get()
    if (!state.selectedSize || !state.selectedMaterial || state.quantity <= 0) {
      return
    }

    const basePrice = template.price.base
    const sizeMultiplier = (state.selectedSize.width * state.selectedSize.height * (state.selectedSize.depth || 1)) / 1000000
    const materialMultiplier = state.selectedMaterial.priceMultiplier
    const quantity = state.quantity

    set({
      totalPrice: basePrice * sizeMultiplier * materialMultiplier * quantity
    })
  },

  reset: () => {
    set({
      selectedSize: null,
      selectedMaterial: null,
      quantity: 100,
      totalPrice: 0,
      errors: [],
      isValid: false
    })
  }
}))