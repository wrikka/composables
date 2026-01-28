import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWakeLock } from './useWakeLock'

describe('useWakeLock', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      wakeLock: {
        request: vi.fn(() => Promise.resolve({
          addEventListener: vi.fn(),
          release: vi.fn(),
        })),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should lock wake lock', async () => {
    const { lock, isLocked } = useWakeLock()
    await lock()

    expect(navigator.wakeLock.request).toHaveBeenCalledWith('screen')
    expect(isLocked.value).toBe(true)
  })

  it('should unlock wake lock', () => {
    const { unlock, isLocked } = useWakeLock()
    unlock()

    expect(isLocked.value).toBe(false)
  })
})
