import { render, screen, fireEvent, within } from '@testing-library/react'
import { SizeSelector } from '@/components/design-detail/SizeSelector'
import { vi } from 'vitest'

describe('SizeSelector 组件', () => {
  const mockSizes = [
    { 
      id: 'small', 
      name: '小号', 
      width: 100, 
      height: 100, 
      description: '适合小型产品' 
    },
    { 
      id: 'medium', 
      name: '中号', 
      width: 200, 
      height: 200, 
      description: '适合中型产品' 
    }
  ]

  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('应该正确渲染所有尺寸选项', () => {
    render(
      <SizeSelector 
        sizes={mockSizes}
        selected={mockSizes[0].id}
        onChange={mockOnChange}
      />
    )

    // 验证标题
    expect(screen.getByText('选择尺寸')).toBeInTheDocument()

    // 验证尺寸选项
    mockSizes.forEach(size => {
      const sizeOption = screen.getByTestId(`size-option-${size.id}`)
      expect(within(sizeOption).getByText(size.name)).toBeInTheDocument()
      
      if (size.description) {
        const descriptionElement = screen.getByTestId(`size-description-${size.id}`)
        expect(descriptionElement).toHaveTextContent(size.description)
      }
      
      expect(within(sizeOption).getByText(new RegExp(`${size.width}.*×.*${size.height}.*mm`))).toBeInTheDocument()
    })
  })

  it('选择尺寸应该触发onChange', () => {
    render(
      <SizeSelector 
        sizes={mockSizes}
        selected={mockSizes[0].id}
        onChange={mockOnChange}
      />
    )

    const secondSize = mockSizes[1]
    const sizeButton = screen.getByTestId(`size-option-${secondSize.id}`)
    
    fireEvent.click(sizeButton)
    
    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith(secondSize)
  })
})