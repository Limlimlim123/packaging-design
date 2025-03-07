import { vi } from 'vitest'

export const mockNextAuth = {
  __esModule: true,
  default: vi.fn((config) => ({
    signIn: vi.fn(),
    signOut: vi.fn(),
    useSession: vi.fn(() => ({
      data: { user: { id: 'test-user' } },
      status: 'authenticated'
    }))
  })),
  getServerSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user' }
  }))
}

vi.mock('next-auth', () => mockNextAuth)