import { create } from 'zustand'

interface DesignState {
  selectedSize: any
  selectedMaterial: any
  quantity: number
  totalPrice: number
  isValid: boolean
  errors: string[]
  setSize: (size: any) => void
  setMaterial: (material: any) => void
  setQuantity: (quantity: number) => void
  updatePrice: (template: any) => void
  reset: () => void
}

export const createMockDesignStore = () => create<DesignState>((set) => ({
  selectedSize: null,
  selectedMaterial: null,
  quantity: 100,
  totalPrice: 0,
  isValid: false,
  errors: [],
  setSize: (size) => set({ selectedSize: size }),
  setMaterial: (material) => set({ selectedMaterial: material }),
  setQuantity: (quantity) => set({ quantity }),
  updatePrice: () => set({ totalPrice: 1000 }),
  reset: () => set({
    selectedSize: null,
    selectedMaterial: null,
    quantity: 100,
    totalPrice: 0,
    isValid: false,
    errors: []
  })
}))