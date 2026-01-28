import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDeviceThermal } from './useDeviceThermal'

describe('useDeviceThermal', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      thermal: {
        getThermalStatus: vi.fn().mockResolvedValue({
          temperature: 35,
          overheated: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return thermal status', async () => {
    const { temperature, overheated } = useDeviceThermal()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(temperature.value).toBe(35)
    expect(overheated.value).toBe(false)
  })

  it('should handle thermal API not available', () => {
    vi.stubGlobal('navigator', {})

    const { temperature, overheated } = useDeviceThermal()

    expect(temperature.value).toBeNull()
    expect(overheated.value).toBe(false)
  })
})
