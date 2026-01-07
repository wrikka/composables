import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDebounceFn } from './useDebounceFn'

describe('useDebounceFn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should debounce function calls', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounceFn(mockFn, { delay: 100 })

    debouncedFn('arg1')
    debouncedFn('arg2')
    debouncedFn('arg3')

    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('arg3')
  })

  it('should use default delay', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounceFn(mockFn)

    debouncedFn()
    expect(mockFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should handle isPending state', () => {
    const mockFn = vi.fn()
    const { debouncedFn, isPending } = useDebounceFn(mockFn, { delay: 100 })

    expect(isPending.value).toBe(false)

    debouncedFn()
    expect(isPending.value).toBe(true)

    vi.advanceTimersByTime(100)
    expect(isPending.value).toBe(false)
  })

  it('should cancel pending calls', () => {
    const mockFn = vi.fn()
    const { debouncedFn, cancel, isPending } = useDebounceFn(mockFn, { delay: 100 })

    debouncedFn()
    expect(isPending.value).toBe(true)

    cancel()
    expect(isPending.value).toBe(false)

    vi.advanceTimersByTime(100)
    expect(mockFn).not.toHaveBeenCalled()
  })

  it('should flush immediately', () => {
    const mockFn = vi.fn()
    const { debouncedFn, flush, isPending } = useDebounceFn(mockFn, { delay: 100 })

    debouncedFn('flushed')
    flush('immediate')

    expect(mockFn).toHaveBeenCalledWith('immediate')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(isPending.value).toBe(false)
  })

  it('should handle multiple debounced instances', () => {
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()
    
    const { debouncedFn: debounced1 } = useDebounceFn(mockFn1, { delay: 100 })
    const { debouncedFn: debounced2 } = useDebounceFn(mockFn2, { delay: 200 })

    debounced1('fn1')
    debounced2('fn2')

    vi.advanceTimersByTime(100)
    expect(mockFn1).toHaveBeenCalledWith('fn1')
    expect(mockFn2).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mockFn2).toHaveBeenCalledWith('fn2')
  })

  it('should handle function with multiple arguments', () => {
    const mockFn = vi.fn()
    const { debouncedFn } = useDebounceFn(mockFn, { delay: 100 })

    debouncedFn('arg1', 'arg2', { key: 'value' })

    vi.advanceTimersByTime(100)
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' })
  })
})
