import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { calculatePrice } from '@/lib/price-calculator'

interface PriceCalculatorProps {
  basePrice: number
  size?: { id: string; price?: number; width?: number; height?: number }
  material?: { id: string; priceFactor?: number }
  quantity: number
  onQuantityChange: (quantity: number) => void
}

// 计算尺寸因子
function calculateSizeFactor(size: { id: string; price?: number; width?: number; height?: number }) {
  if (size.price) return size.price
  
  // 如果没有直接提供价格，可以根据尺寸计算
  if (size.width && size.height) {
    const area = size.width * size.height
    return (area / 10000).toFixed(2) // 假设每10000平方毫米为基准
  }
  
  return 1 // 默认因子
}

export function PriceCalculator({ basePrice, size, material, quantity, onQuantityChange }: PriceCalculatorProps) {
  const totalPrice = calculatePrice(basePrice, size, material, quantity)
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      onQuantityChange(value)
    }
  }
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">价格计算</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>基础价格:</span>
          <span>¥{basePrice.toFixed(2)}</span>
        </div>
        {size && (
          <div className="flex justify-between">
            <span>尺寸调整:</span>
            <span>×{calculateSizeFactor(size)}</span>
          </div>
        )}
        {material && material.priceFactor && (
          <div className="flex justify-between">
            <span>材质调整:</span>
            <span>×{material.priceFactor}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span>数量:</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20"
              data-testid="quantity-input"
            />
          </div>
        </div>
        <div className="flex justify-between font-medium text-lg pt-2 border-t">
          <span>总价:</span>
          <span data-testid="total-price">¥{totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}