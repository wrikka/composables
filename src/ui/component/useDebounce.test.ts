import { ref } from 'vue'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useDebounce } from './useDebounce'

vi.useFakeTimers()

describe('useDebounce', () => {
  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should debounce the value', async () => {
    const value = ref(0)
    const debouncedValue = useDebounce(value, 200)

    expect(debouncedValue.value).toBe(0)

    value.value = 1
    expect(debouncedValue.value).toBe(0)

    vi.advanceTimersByTime(100)
    expect(debouncedValue.value).toBe(0)

    vi.advanceTimersByTime(100)
    expect(debouncedValue.value).toBe(1)
  })

  it('should update immediately after the delay', () => {
    const value = ref('test')
    const debouncedValue = useDebounce(value, 500)

    value.value = 'updated'
    expect(debouncedValue.value).toBe('test')

    vi.advanceTimersByTime(500)
    expect(debouncedValue.value).toBe('updated')
  })
})
