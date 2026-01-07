import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThrottleFn } from './useThrottleFn'

describe('useThrottleFn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should throttle function calls', () => {
    const mockFn = vi.fn()
    const { throttledFn } = useThrottleFn(mockFn, { delay: 100 })

    throttledFn('call1')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('call1')

    throttledFn('call2')
    throttledFn('call3')
    expect(mockFn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('call3')
  })

  it('should use default delay', () => {
    const mockFn = vi.fn()
    const { throttledFn } = useThrottleFn(mockFn)

    throttledFn()
    expect(mockFn).toHaveBeenCalledTimes(1)

    throttledFn()
    expect(mockFn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should handle leading option', () => {
    const mockFn = vi.fn()
    const { throttledFn } = useThrottleFn(mockFn, { delay: 100, leading: false })

    throttledFn('call1')
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledWith('call1')
  })

  it('should handle trailing option', () => {
    const mockFn = vi.fn()
    const { throttledFn } = useThrottleFn(mockFn, { delay: 100, trailing: false })

    throttledFn('call1')
    expect(mockFn).toHaveBeenCalledTimes(1)

    throttledFn('call2')
    throttledFn('call3')
    expect(mockFn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1) // Should not call trailing
  })

  it('should handle isPending state', () => {
    const mockFn = vi.fn()
    const { throttledFn, isPending } = useThrottleFn(mockFn, { delay: 100 })

    expect(isPending.value).toBe(false)

    throttledFn()
    throttledFn() // This should set isPending
    expect(isPending.value).toBe(true)

    vi.advanceTimersByTime(100)
    expect(isPending.value).toBe(false)
  })

  it('should cancel pending calls', () => {
    const mockFn = vi.fn()
    const { throttledFn, cancel, isPending } = useThrottleFn(mockFn, { delay: 100 })

    throttledFn()
    throttledFn() // Creates pending call
    expect(isPending.value).toBe(true)

    cancel()
    expect(isPending.value).toBe(false)

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1) // Only the first call
  })

  it('should flush immediately', () => {
    const mockFn = vi.fn()
    const { throttledFn, flush } = useThrottleFn(mockFn, { delay: 100 })

    throttledFn('throttled')
    flush('immediate')

    expect(mockFn).toHaveBeenCalledWith('immediate')
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple throttled instances', () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()
    
    const { throttledFn: throttled1 } = useThrottleFn(mockFn1, { delay: 100 })
    const { throttledFn: throttled2 } = useThrottleFn(mockFn2, { delay: 200 })

    throttled1('fn1')
    throttled2('fn2')

    expect(mockFn1).toHaveBeenCalledTimes(1)
    expect(mockFn2).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttled1('fn1-again')
    expect(mockFn1).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(100)
    expect(mockFn2).toHaveBeenCalledTimes(2)
  })
})
