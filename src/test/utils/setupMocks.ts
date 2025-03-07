import { vi } from 'vitest'

// Mock fabric
export const setupFabricMock = () => {
  vi.mock('fabric', () => {
    const Canvas = vi.fn().mockImplementation((el, options) => ({
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
      toDataURL: vi.fn()
    }))

    return {
      fabric: {
        Canvas,
        IText: vi.fn(),
        Image: vi.fn()
      }
    }
  })
}

// Mock next-auth
export const setupNextAuthMock = () => {
  vi.mock('next-auth', () => {
    return {
      default: vi.fn((config) => ({
        GET: vi.fn(),
        POST: vi.fn()
      })),
      getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'test-user' }
      }))
    }
  })

  vi.mock('next-auth/react', () => ({
    useSession: vi.fn(() => ({
      data: { user: { id: 'test-user' } },
      status: 'authenticated'
    })),
    signIn: vi.fn(),
    signOut: vi.fn()
  }))
}