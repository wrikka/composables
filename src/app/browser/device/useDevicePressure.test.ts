import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDevicePressure } from './useDevicePressure'

describe('useDevicePressure', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      pressure: {
        getPressureStatus: vi.fn().mockResolvedValue({
          cpuPressure: 0.5,
          memoryPressure: 0.3,
          overallPressure: 0.4,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return pressure status', async () => {
    const { cpuPressure, memoryPressure, overallPressure } = useDevicePressure()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(cpuPressure.value).toBe(0.5)
    expect(memoryPressure.value).toBe(0.3)
    expect(overallPressure.value).toBe(0.4)
  })

  it('should handle pressure API not available', () => {
    vi.stubGlobal('navigator', {})

    const { cpuPressure, memoryPressure, overallPressure } = useDevicePressure()

    expect(cpuPressure.value).toBeNull()
    expect(memoryPressure.value).toBeNull()
    expect(overallPressure.value).toBeNull()
  })
})
