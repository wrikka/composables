import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNetworkBandwidth } from './useNetworkBandwidth'

describe('useNetworkBandwidth', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should measure network bandwidth', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(new Blob([new ArrayBuffer(1000)])),
    } as Response)

    const { bandwidth, averageBandwidth } = useNetworkBandwidth()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(bandwidth.value).toBeGreaterThanOrEqual(0)
    expect(averageBandwidth.value).toBeGreaterThanOrEqual(0)
  })

  it('should handle fetch errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { bandwidth } = useNetworkBandwidth()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(bandwidth.value).toBeNull()
  })
})
