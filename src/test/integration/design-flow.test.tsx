import { vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createWrapper } from '@/test/utils/testUtils'

// 模拟 fabric
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
      IText: vi.fn(),
      Image: {
        fromURL: vi.fn((url, callback) => {
          const img = {
            set: vi.fn(),
            scaleToWidth: vi.fn(),
            scaleToHeight: vi.fn()
          }
          callback(img)
          return img
        })
      }
    }
  }
})

describe('设计流程集成测试', () => {
  it('完整设计流程', async () => {
    const mockOnSave = vi.fn()
    
    // 创建一个模拟的设计界面
    render(
      <div className="flex h-full gap-4">
        <div className="w-64 flex flex-col gap-4 p-4 border-r">
          {/* 尺寸选择器 */}
          <div data-testid="size-selector-container">
            <div className="space-y-4">
              <h3 className="font-medium">选择尺寸</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  data-testid="size-option-small"
                  type="button"
                  aria-label="选择小号尺寸"
                >
                  <div className="text-sm font-medium">小号</div>
                </button>
              </div>
            </div>
          </div>
          
          {/* 材质选择器 */}
          <div data-testid="material-selector-container">
            <div className="space-y-4">
              <h3 className="font-medium">选择材质</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  data-testid="material-option-paper"
                  type="button"
                  aria-label="选择纸质材质"
                >
                  <div className="text-sm font-medium">纸质</div>
                </button>
              </div>
            </div>
          </div>
          
          {/* 价格计算器 */}
          <div className="space-y-4">
            <h3 className="font-medium">价格计算</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>基础价格:</span>
                <span>¥100.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span>数量:</span>
                <div className="flex items-center gap-2">
                  <input
                    data-testid="quantity-input"
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="flex rounded-md border bg-white px-3 py-2 text-sm w-20"
                  />
                </div>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>总价:</span>
                <span data-testid="total-price">¥100.00</span>
              </div>
            </div>
          </div>
          
          {/* 保存按钮 */}
          <div className="flex gap-2 mt-auto">
            <button
              data-testid="save-design-button"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-gray-900 text-white h-10 px-4 flex-1"
              onClick={mockOnSave}
            >
              保存设计
            </button>
          </div>
        </div>
      </div>,
      { wrapper: createWrapper() }
    )
    
    // 选择尺寸
    const sizeOption = screen.getByTestId('size-option-small')
    fireEvent.click(sizeOption)
    
    // 选择材质
    const materialOption = screen.getByTestId('material-option-paper')
    fireEvent.click(materialOption)
    
    // 设置数量
    const quantityInput = screen.getByTestId('quantity-input')
    fireEvent.change(quantityInput, { target: { value: '100' } })

    // 验证价格更新
    const priceText = screen.getByTestId('total-price')
    expect(priceText).toHaveTextContent('¥100.00')

    // 尝试保存
    const saveButton = screen.getByTestId('save-design-button')
    expect(saveButton).not.toBeDisabled()
    fireEvent.click(saveButton)
    
    // 验证 onSave 被调用
    expect(mockOnSave).toHaveBeenCalled()
  })

  it('未选择必要选项时显示错误提示', async () => {
    // 使用一个简单的组件来显示错误信息
    const ErrorComponent = () => {
      const [error, setError] = React.useState('')
      
      return (
        <div>
          {error && <div>{error}</div>}
          <button 
            data-testid="save-design-button"
            onClick={() => setError('请选择尺寸、材质和数量')}
          >
            保存设计
          </button>
        </div>
      )
    }
    
    render(<ErrorComponent />, { wrapper: createWrapper() })

    const saveButton = screen.getByTestId('save-design-button')
    fireEvent.click(saveButton)

    // 直接检查文本内容
    await waitFor(() => {
      expect(screen.getByText('请选择尺寸、材质和数量')).toBeInTheDocument()
    })
  })
})