import { render, screen, fireEvent } from '@testing-library/react'
import { PriceCalculator } from '@/components/design-detail/PriceCalculator'
import { vi } from 'vitest'

// 模拟价格计算函数
vi.mock('@/lib/price-calculator', () => ({
  calculatePrice: () => 10000 // 返回固定值用于测试
}))

describe('PriceCalculator 组件', () => {
  it('正确显示价格和数量', () => {
    const mockOnQuantityChange = vi.fn()
    
    render(
      <PriceCalculator
        basePrice={100}
        quantity={100}
        onQuantityChange={mockOnQuantityChange}
      />
    )
    
    // 检查数量输入框
    const quantityInput = screen.getByTestId('quantity-input')
    expect(quantityInput).toHaveValue(100)
    
    // 检查价格显示
    const priceElement = screen.getByTestId('total-price')
    expect(priceElement).toHaveTextContent('¥10000.00')
  })
  
  it('修改数量应该触发回调', () => {
    const mockOnQuantityChange = vi.fn()
    
    render(
      <PriceCalculator
        basePrice={100}
        quantity={100}
        onQuantityChange={mockOnQuantityChange}
      />
    )
    
    const quantityInput = screen.getByTestId('quantity-input')
    fireEvent.change(quantityInput, { target: { value: '200' } })
    
    expect(mockOnQuantityChange).toHaveBeenCalledWith(200)
  })
})