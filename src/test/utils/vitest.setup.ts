import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import '@testing-library/jest-dom'

// 扩展断言
expect.extend(matchers)

// 创建 fabric mock 对象
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
    setBackgroundImage: vi.fn(),
    width: 800,
    height: 600
  })),
  Image: {
    fromURL: vi.fn().mockImplementation((url, callback) => {
      const mockImg = {
        width: 800,
        height: 600,
        set: vi.fn(),
        setCoords: vi.fn()
      }
      callback(mockImg)
      return mockImg
    })
  },
  IText: vi.fn().mockImplementation((text, options = {}) => ({
    set: vi.fn(),
    setCoords: vi.fn(),
    ...options
  }))
}

// 全局注入 fabric 对象
global.fabric = fabricMock

// Mock fabric 模块
vi.mock('fabric', () => {
  return {
    __esModule: true,
    default: fabricMock,
    ...fabricMock
  }
})

// Mock next-auth
vi.mock('next-auth', () => {
  return {
    __esModule: true,
    default: vi.fn((config) => ({
      GET: vi.fn(),
      POST: vi.fn(),
      handlers: {
        GET: vi.fn(),
        POST: vi.fn()
      }
    })),
    getServerSession: vi.fn(() => Promise.resolve({
      user: { id: 'test-user' }
    }))
  }
})

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: vi.fn(() => ({
    data: { user: { id: 'test-user' } },
    status: 'authenticated'
  })),
  signIn: vi.fn(),
  signOut: vi.fn()
}))

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

// 每个测试后清理
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})