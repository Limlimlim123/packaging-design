import { render, screen, fireEvent } from '@testing-library/react'
import { MaterialSelector } from '@/components/design-detail/MaterialSelector'
import { mockTemplateData } from '@/test/utils/mocks'

describe('MaterialSelector 组件', () => {
  const onChangeMock = vi.fn()

  beforeEach(() => {
    onChangeMock.mockClear()
  })

  test('应该正确渲染所有材质选项', () => {
    render(
      <MaterialSelector 
        materials={mockTemplateData.materials}
        selected={mockTemplateData.materials[0].id}
        onChange={onChangeMock}
      />
    )

    mockTemplateData.materials.forEach(material => {
      expect(screen.getByText(material.name)).toBeInTheDocument()
      expect(screen.getByText(material.description)).toBeInTheDocument()
    })
  })

  test('选择材质应该触发onChange', () => {
    render(
      <MaterialSelector 
        materials={mockTemplateData.materials}
        selected={mockTemplateData.materials[0].id}
        onChange={onChangeMock}
      />
    )

    const secondMaterialButton = screen.getByText(mockTemplateData.materials[1].name)
    fireEvent.click(secondMaterialButton)

    // 修改这里的期望值，因为组件传递了整个 material 对象
    expect(onChangeMock).toHaveBeenCalledWith(mockTemplateData.materials[1])
  })
})