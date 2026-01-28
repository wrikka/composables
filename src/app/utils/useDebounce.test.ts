import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce value changes', () => {
    const value = ref('initial')
    const debounced = useDebounce(() => value.value, 300)

    expect(debounced.value).toBe('initial')

    value.value = 'changed1'
    vi.advanceTimersByTime(100)
    expect(debounced.value).toBe('initial')

    vi.advanceTimersByTime(200)
    expect(debounced.value).toBe('changed1')
  })

  it('should cancel previous timeout', () => {
    const value = ref('initial')
    const debounced = useDebounce(() => value.value, 300)

    value.value = 'changed1'
    vi.advanceTimersByTime(100)

    value.value = 'changed2'
    vi.advanceTimersByTime(300)

    expect(debounced.value).toBe('changed2')
  })
})
