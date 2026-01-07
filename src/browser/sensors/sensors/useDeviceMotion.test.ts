import { describe, it, expect } from 'vitest'
import { useDeviceMotion } from './useDeviceMotion'

describe('useDeviceMotion', () => {
  it('should return refs with initial values', () => {
    const { acceleration, accelerationIncludingGravity, rotationRate, interval } = useDeviceMotion()

    expect(acceleration.value).toEqual({ x: 0, y: 0, z: 0 })
    expect(accelerationIncludingGravity.value).toEqual({ x: 0, y: 0, z: 0 })
    expect(rotationRate.value).toEqual({ alpha: 0, beta: 0, gamma: 0 })
    expect(interval.value).toBe(0)
  })

  // Note: Testing the actual event firing in JSDOM is complex.
  // This test primarily ensures the composable initializes correctly.
  // A more thorough test would require an environment that supports DeviceMotionEvent.
})
