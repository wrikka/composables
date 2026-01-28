import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useMotion } from './useMotion'

describe('useMotion', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should start motion tracking', () => {
    const { start } = useMotion()
    start()

    expect(window.addEventListener).toHaveBeenCalledWith('devicemotion', expect.any(Function))
  })

  it('should stop motion tracking', () => {
    const { stop } = useMotion()
    stop()

    expect(window.removeEventListener).toHaveBeenCalledWith('devicemotion', expect.any(Function))
  })
})
