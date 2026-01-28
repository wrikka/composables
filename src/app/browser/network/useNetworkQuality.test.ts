import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNetworkQuality } from './useNetworkQuality'

describe('useNetworkQuality', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should measure network quality', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(new Blob([new ArrayBuffer(1000)])),
    } as Response)

    const { quality, score } = useNetworkQuality()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(quality.value).toBeTruthy()
    expect(score.value).toBeGreaterThanOrEqual(0)
    expect(score.value).toBeLessThanOrEqual(100)
  })

  it('should handle fetch errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { quality, score } = useNetworkQuality()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(quality.value).toBeNull()
    expect(score.value).toBeNull()
  })
})
