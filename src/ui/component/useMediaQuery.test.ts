import { describe, it, expect, vi } from 'vitest'
import { useMediaQuery } from './useMediaQuery'

// Mock window.matchMedia
const matchMediaMock = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

vi.stubGlobal('matchMedia', matchMediaMock)

describe('useMediaQuery', () => {
  it('should return false for non-matching query', () => {
    const isMatching = useMediaQuery('(min-width: 1024px)')
    expect(isMatching.value).toBe(false)
  })

  it('should return true for matching query', () => {
    matchMediaMock.mockImplementationOnce((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const isMatching = useMediaQuery('(min-width: 1024px)')
    expect(isMatching.value).toBe(true)
  })
})
