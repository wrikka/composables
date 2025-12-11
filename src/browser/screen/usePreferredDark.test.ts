import { describe, it, expect, vi } from 'vitest'
import { usePreferredDark } from './usePreferredDark'

// Note: JSDOM does not support matchMedia, so we need to mock it.
describe('usePreferredDark', () => {
  it('should return true if prefers-color-scheme is dark', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { isDark } = usePreferredDark()
    expect(isDark.value).toBe(true)
  })

  it('should return false if prefers-color-scheme is not dark', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const { isDark } = usePreferredDark()
    expect(isDark.value).toBe(false)
  })
})
