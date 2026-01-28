import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useThrottle } from './useThrottle'

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throttle value changes', () => {
    const value = ref('initial')
    const throttled = useThrottle(() => value.value, 300)

    expect(throttled.value).toBe('initial')

    value.value = 'changed1'
    expect(throttled.value).toBe('changed1')

    value.value = 'changed2'
    expect(throttled.value).toBe('changed1')

    vi.advanceTimersByTime(300)
    value.value = 'changed3'
    expect(throttled.value).toBe('changed3')
  })
})
