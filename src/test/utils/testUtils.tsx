import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import { vi } from 'vitest'

// Mock fabric
const fabricMock = {
  Canvas: vi.fn().mockImplementation((el, options = {}) => ({
    setWidth: vi.fn(),
    setHeight: vi.fn(),
    renderAll: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    getObjects: vi.fn(() => []),
    setActiveObject: vi.fn(),
    getActiveObject: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    moveTo: vi.fn(),
    dispose: vi.fn(),
    getZoom: vi.fn(() => 1),
    setZoom: vi.fn(),
    scale: vi.fn(),
    toDataURL: vi.fn(),
    setBackgroundImage: vi.fn()
  })),
  Image: {
    fromURL: vi.fn().mockImplementation((url, callback) => {
      callback(new Image())
    })
  },
  IText: vi.fn().mockImplementation((text) => ({
    set: vi.fn(),
    setCoords: vi.fn()
  }))
}

global.fabric = fabricMock

export function createWrapper() {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }
}

export const resetAllState = () => {
  vi.clearAllMocks()
}

export function render(
  ui: React.ReactElement,
  options: { wrapper?: React.ComponentType<any> } = {}
) {
  const Wrapper = options.wrapper || createWrapper()
  return rtlRender(ui, { wrapper: Wrapper })
}

export * from '@testing-library/react'