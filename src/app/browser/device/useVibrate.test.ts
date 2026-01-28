import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useVibrate } from './useVibrate'

describe('useVibrate', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      vibrate: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should vibrate', () => {
    const { vibrate, isVibrating } = useVibrate()
    vibrate(200)

    expect(navigator.vibrate).toHaveBeenCalledWith(200)
    expect(isVibrating.value).toBe(true)
  })

  it('should stop vibration', () => {
    const { stop, isVibrating } = useVibrate()
    stop()

    expect(navigator.vibrate).toHaveBeenCalledWith(0)
    expect(isVibrating.value).toBe(false)
  })
})
