import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDeviceCores } from './useDeviceCores'

describe('useDeviceCores', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      hardwareConcurrency: 8,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return device cores info', async () => {
    const { cores, hardwareConcurrency } = useDeviceCores()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(cores.value).toBe(8)
    expect(hardwareConcurrency.value).toBe(8)
  })

  it('should handle hardwareConcurrency not available', () => {
    vi.stubGlobal('navigator', {})

    const { cores, hardwareConcurrency } = useDeviceCores()

    expect(cores.value).toBeNull()
    expect(hardwareConcurrency.value).toBeNull()
  })
})
