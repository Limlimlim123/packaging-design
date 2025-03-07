import { vi } from 'vitest'

export const fabric = {
  Canvas: class {
    constructor() {
      return {
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
        toJSON: vi.fn(() => ({ objects: [], version: '5.2.1' })),
        width: 500,
        height: 500
      }
    }
  },
  IText: class {
    constructor() {
      return {
        set: vi.fn(),
        setCoords: vi.fn()
      }
    }
  },
  Image: {
    fromURL: vi.fn((url, callback, options) => {
      const img = {
        scaleToWidth: vi.fn(),
        scaleToHeight: vi.fn(),
        set: vi.fn(),
        setCoords: vi.fn()
      }
      if (callback) callback(img)
      return img
    })
  },
  Text: class {
    constructor(text, options) {
      return {
        text,
        options,
        set: vi.fn(),
        setCoords: vi.fn()
      }
    }
  }
}

vi.mock('fabric', () => ({ fabric }))