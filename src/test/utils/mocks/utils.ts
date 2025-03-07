import { vi } from 'vitest'

export const mockUtils = {
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => mockUtils.cn(...args)
}))