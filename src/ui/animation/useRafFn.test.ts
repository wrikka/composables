import { describe, it, expect, vi, afterEach } from 'vitest'
import { useRafFn } from './useRafFn'

vi.useFakeTimers()

describe('useRafFn', () => {
  const callback = vi.fn()

  afterEach(() => {
    callback.mockClear()
  })

  it('should call callback on each frame', () => {
    const { resume } = useRafFn(callback, { immediate: false })

    resume()
    vi.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalled()
  })

  it('should start immediately by default', () => {
    useRafFn(callback)
    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalled()
  })

  it('should not start immediately if immediate is false', () => {
    useRafFn(callback, { immediate: false })
    vi.advanceTimersByTime(100)
    expect(callback).not.toHaveBeenCalled()
  })

  it('should be pausable and resumable', () => {
    const { isActive, pause, resume } = useRafFn(callback)

    expect(isActive.value).toBe(true)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)

    pause()
    expect(isActive.value).toBe(false)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)

    resume()
    expect(isActive.value).toBe(true)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(2)
  })
})
