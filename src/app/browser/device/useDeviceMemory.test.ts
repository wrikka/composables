import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDeviceMemory } from './useDeviceMemory'

describe('useDeviceMemory', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      deviceMemory: 8,
    })
    vi.stubGlobal('performance', {
      memory: {
        jsHeapSizeLimit: 2000000000,
        totalJSHeapSize: 1000000000,
        usedJSHeapSize: 500000000,
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return device memory info', async () => {
    const { memory, jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = useDeviceMemory()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(memory.value).toBe(8)
    expect(jsHeapSizeLimit.value).toBe(2000000000)
    expect(totalJSHeapSize.value).toBe(1000000000)
    expect(usedJSHeapSize.value).toBe(500000000)
  })

  it('should handle memory API not available', () => {
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('performance', {})

    const { memory, jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = useDeviceMemory()

    expect(memory.value).toBeNull()
    expect(jsHeapSizeLimit.value).toBeNull()
    expect(totalJSHeapSize.value).toBeNull()
    expect(usedJSHeapSize.value).toBeNull()
  })
})
