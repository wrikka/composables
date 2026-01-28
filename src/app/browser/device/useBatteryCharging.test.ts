import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBatteryCharging } from './useBatteryCharging'

describe('useBatteryCharging', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      getBattery: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return battery charging state', async () => {
    const mockBattery = {
      charging: true,
      chargingTime: 3600,
      dischargingTime: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    ;(navigator as any).getBattery = vi.fn().mockResolvedValue(mockBattery)

    const { isCharging, chargingTime, dischargingTime } = useBatteryCharging()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(isCharging.value).toBe(true)
    expect(chargingTime.value).toBe(3600)
    expect(dischargingTime.value).toBeNull()
  })

  it('should handle discharging state', async () => {
    const mockBattery = {
      charging: false,
      chargingTime: null,
      dischargingTime: 7200,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    ;(navigator as any).getBattery = vi.fn().mockResolvedValue(mockBattery)

    const { isCharging, chargingTime, dischargingTime } = useBatteryCharging()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(isCharging.value).toBe(false)
    expect(chargingTime.value).toBeNull()
    expect(dischargingTime.value).toBe(7200)
  })

  it('should handle battery API not available', () => {
    vi.stubGlobal('navigator', {})

    const { isCharging, chargingTime, dischargingTime } = useBatteryCharging()

    expect(isCharging.value).toBe(false)
    expect(chargingTime.value).toBeNull()
    expect(dischargingTime.value).toBeNull()
  })
})
