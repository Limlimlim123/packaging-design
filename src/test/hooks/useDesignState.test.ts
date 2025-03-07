import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createMockDesignStore } from '../utils/mocks/store'

// 创建一个新的 store 实例
const useDesignState = createMockDesignStore()

// 模拟数据
const mockSize = {
  id: 'size-1',
  name: '小号',
  width: 100,
  height: 100,
  depth: 100,
  price: 10
}

const mockMaterial = {
  id: 'material-1',
  name: '普通纸',
  priceMultiplier: 1,
  description: '基础材质'
}

const mockTemplate = {
  id: 'template-1',
  name: '测试模板',
  price: {
    base: 100
  }
}

describe('useDesignState', () => {
  beforeEach(() => {
    useDesignState.getState().reset()
  })

  it('应该有正确的初始状态', () => {
    const { result } = renderHook(() => useDesignState())
    
    expect(result.current.selectedSize).toBeNull()
    expect(result.current.selectedMaterial).toBeNull()
    expect(result.current.quantity).toBe(100)
    expect(result.current.totalPrice).toBe(0)
    expect(result.current.isValid).toBe(false)
    expect(result.current.errors).toEqual([])
  })

  it('设置尺寸时应该更新状态', () => {
    const { result } = renderHook(() => useDesignState())
    
    act(() => {
      result.current.setSize(mockSize)
    })

    expect(result.current.selectedSize).toEqual(mockSize)
  })

  it('设置材质时应该更新状态', () => {
    const { result } = renderHook(() => useDesignState())
    
    act(() => {
      result.current.setMaterial(mockMaterial)
    })

    expect(result.current.selectedMaterial).toEqual(mockMaterial)
  })

  it('设置数量时应该更新状态', () => {
    const { result } = renderHook(() => useDesignState())
    
    act(() => {
      result.current.setQuantity(200)
    })

    expect(result.current.quantity).toBe(200)
  })

  it('更新价格时应该正确计算', () => {
    const { result } = renderHook(() => useDesignState())
    
    act(() => {
      result.current.setSize(mockSize)
      result.current.setMaterial(mockMaterial)
      result.current.setQuantity(100)
      result.current.updatePrice(mockTemplate)
    })

    expect(result.current.totalPrice).toBe(1000)
  })

  it('重置时应该恢复初始状态', () => {
    const { result } = renderHook(() => useDesignState())
    
    act(() => {
      result.current.setSize(mockSize)
      result.current.setMaterial(mockMaterial)
      result.current.setQuantity(200)
      result.current.reset()
    })

    expect(result.current.selectedSize).toBeNull()
    expect(result.current.selectedMaterial).toBeNull()
    expect(result.current.quantity).toBe(100)
    expect(result.current.totalPrice).toBe(0)
    expect(result.current.isValid).toBe(false)
    expect(result.current.errors).toEqual([])
  })
})