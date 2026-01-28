import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useResizeObserver } from './useResizeObserver'

describe('useResizeObserver', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', class {
      observe = vi.fn()
      disconnect = vi.fn()
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should observe element', () => {
    const { observe, width, height } = useResizeObserver()
    const element = document.createElement('div')
    observe(element)

    expect(width.value).toBe(0)
    expect(height.value).toBe(0)
  })

  it('should unobserve element', () => {
    const { observe, unobserve } = useResizeObserver()
    const element = document.createElement('div')
    observe(element)
    unobserve()
  })
})
