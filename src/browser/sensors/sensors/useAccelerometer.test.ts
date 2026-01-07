import { describe, it, expect, vi } from 'vitest'
import { useAccelerometer } from './useAccelerometer'

// Mock Accelerometer class
class MockAccelerometer {
  start = vi.fn()
  stop = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  x = 0
  y = 0
  z = 0

  constructor(_options?: any) {}
}

(global as any).Accelerometer = MockAccelerometer as any

describe('useAccelerometer', () => {
  it('should be supported if Accelerometer is in window', () => {
    const { isSupported } = useAccelerometer()
    expect(isSupported).toBe(true)
  })

  it('should return refs for x, y, and z', () => {
    const { x, y, z } = useAccelerometer()
    expect(x.value).toBe(0)
    expect(y.value).toBe(0)
    expect(z.value).toBe(0)
  })
})
