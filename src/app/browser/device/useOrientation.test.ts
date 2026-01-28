import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useOrientation } from './useOrientation'

describe('useOrientation', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should start orientation tracking', () => {
    const { start } = useOrientation()
    start()

    expect(window.addEventListener).toHaveBeenCalledWith('deviceorientation', expect.any(Function))
  })

  it('should stop orientation tracking', () => {
    const { stop } = useOrientation()
    stop()

    expect(window.removeEventListener).toHaveBeenCalledWith('deviceorientation', expect.any(Function))
  })
})
