import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useIntersectionObserver } from './useIntersectionObserver'

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe = vi.fn()
      disconnect = vi.fn()
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should observe element', () => {
    const { observe, isIntersecting } = useIntersectionObserver()
    const element = document.createElement('div')
    observe(element)

    expect(isIntersecting.value).toBe(false)
  })

  it('should unobserve element', () => {
    const { observe, unobserve } = useIntersectionObserver()
    const element = document.createElement('div')
    observe(element)
    unobserve()
  })
})
