import { vi } from 'vitest'

// 在导入其他模块之前先模拟 fabric
vi.mock('fabric', () => {
  return {
    fabric: {
      Canvas: vi.fn(() => ({
        add: vi.fn(),
        remove: vi.fn(),
        renderAll: vi.fn(),
        clear: vi.fn(),
        dispose: vi.fn(),
        setWidth: vi.fn(),
        setHeight: vi.fn(),
        getObjects: vi.fn(() => []),
        setActiveObject: vi.fn(),
        getActiveObject: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        moveTo: vi.fn(),
        getZoom: vi.fn(() => 1),
        setZoom: vi.fn(),
        scale: vi.fn(),
        toDataURL: vi.fn(),
        toJSON: vi.fn(() => ({ objects: [], version: '5.2.1' })),
        width: 500,
        height: 500
      })),
      IText: vi.fn((text, options) => ({
        text,
        options,
        set: vi.fn(),
        setCoords: vi.fn()
      })),
      Image: {
        fromURL: vi.fn((url, callback) => {
          const mockImg = {
            scaleToWidth: vi.fn(),
            scaleToHeight: vi.fn(),
            set: vi.fn(),
            setCoords: vi.fn()
          }
          if (callback) callback(mockImg)
          return mockImg
        })
      },
      Text: vi.fn((text, options) => ({
        text,
        options,
        set: vi.fn(),
        setCoords: vi.fn()
      }))
    }
  }
})

// 模拟 Dropzone 组件
vi.mock('@/components/ui/dropzone', () => {
  return {
    Dropzone: ({ children, onDrop }: any) => (
      <div 
        data-testid="mock-dropzone"
        onClick={() => onDrop && onDrop([new File([''], 'test.png', { type: 'image/png' })])}
      >
        {children}
      </div>
    )
  }
})

// 模拟 useDesignState
vi.mock('@/hooks/useDesignState', () => {
  return {
    useDesignState: () => ({
      sizes: [
        { id: 'small', name: '小号', width: 100, height: 100, price: 0 },
        { id: 'medium', name: '中号', width: 200, height: 200, price: 50 }
      ],
      materials: [
        { id: 'paper', name: '纸质', price: 0 },
        { id: 'plastic', name: '塑料', price: 20 }
      ],
      selectedSize: null,
      selectedMaterial: null,
      quantity: 1,
      setSelectedSize: vi.fn(),
      setSelectedMaterial: vi.fn(),
      setQuantity: vi.fn(),
      reset: vi.fn()
    })
  }
})

// 模拟 PriceCalculator 组件
vi.mock('@/components/design-detail/PriceCalculator', () => {
  return {
    PriceCalculator: ({ basePrice, onQuantityChange }: any) => (
      <div className="space-y-4">
        <h3 className="font-medium">价格计算</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>基础价格:</span>
            <span>¥{basePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>数量:</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  data-testid="quantity-input"
                  type="number"
                  className="flex rounded-md border bg-white px-3 py-2 text-sm ring-offset-background border-gray-200 focus-visible:ring-gray-400 h-10 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 w-20"
                  min="1"
                  value="1"
                  onChange={(e) => onQuantityChange && onQuantityChange(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between font-medium text-lg pt-2 border-t">
            <span>总价:</span>
            <span data-testid="total-price">¥{basePrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    )
  }
})

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DesignCustomizer } from '@/components/design/DesignCustomizer'

describe('DesignCustomizer 组件', () => {
  const onSaveMock = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('应该正确渲染基础UI元素', () => {
    render(<DesignCustomizer onSave={onSaveMock} />)
    
    // 修改测试以匹配实际渲染的元素
    expect(screen.getByTestId('size-selector-container')).toBeInTheDocument()
    expect(screen.getByTestId('material-selector-container')).toBeInTheDocument()
    expect(screen.getByTestId('quantity-input')).toBeInTheDocument()
    expect(screen.getByTestId('save-design-button')).toBeInTheDocument()
  })
  
  it('应该处理文本添加功能', async () => {
    // 模拟 useCanvasObject 钩子
    vi.mock('@/hooks/useCanvasObject', () => ({
      useCanvasObject: () => ({
        addText: vi.fn(),
        addImage: vi.fn(),
        removeObject: vi.fn(),
        updateTextObject: vi.fn(),
        canvas: null
      })
    }))
    
    render(<DesignCustomizer onSave={onSaveMock} />)
    
    // 直接测试输入文本并添加
    const textInput = screen.getByPlaceholderText('输入文字')
    fireEvent.change(textInput, { target: { value: '测试文本' } })
    
    const addTextButton = screen.getByTestId('add-text-button')
    fireEvent.click(addTextButton)
    
    // 验证输入框被清空
    await waitFor(() => {
      expect(textInput).toHaveValue('')
    })
  })
  
  it('没有选择必要选项时不应该保存', () => {
    render(<DesignCustomizer onSave={onSaveMock} />)
    
    const saveButton = screen.getByTestId('save-design-button')
    fireEvent.click(saveButton)
    
    // 验证错误消息显示
    expect(screen.getByText('请选择尺寸、材质和数量')).toBeInTheDocument()
    // 验证 onSave 没有被调用
    expect(onSaveMock).not.toHaveBeenCalled()
  })
})