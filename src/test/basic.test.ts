import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { mockTemplateData } from './utils/mocks'

describe('基础测试', () => {
  it('mockTemplateData 应该包含正确的数据结构', () => {
    expect(mockTemplateData).toHaveProperty('id')
    expect(mockTemplateData).toHaveProperty('name')
    expect(mockTemplateData).toHaveProperty('sizes')
    expect(mockTemplateData).toHaveProperty('materials')
  })

  it('sizes 数组应该包含正确的属性', () => {
    const { sizes } = mockTemplateData
    expect(Array.isArray(sizes)).toBe(true)
    expect(sizes.length).toBeGreaterThan(0)

    sizes.forEach(size => {
      expect(size).toHaveProperty('id')
      expect(size).toHaveProperty('name')
      expect(size).toHaveProperty('width')
      expect(size).toHaveProperty('height')
    })
  })

  it('materials 数组应该包含正确的属性', () => {
    const { materials } = mockTemplateData
    expect(Array.isArray(materials)).toBe(true)
    expect(materials.length).toBeGreaterThan(0)

    materials.forEach(material => {
      expect(material).toHaveProperty('id')
      expect(material).toHaveProperty('name')
      expect(material).toHaveProperty('price')
      expect(material).toHaveProperty('description')
    })
  })
})