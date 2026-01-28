import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNetworkLatency } from './useNetworkLatency'

describe('useNetworkLatency', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should measure network latency', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
    } as Response)

    const { latency, rtt, ping } = useNetworkLatency()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(latency.value).toBeGreaterThanOrEqual(0)
    expect(rtt.value).toBeGreaterThanOrEqual(0)
    expect(ping.value).toBeGreaterThanOrEqual(0)
  })

  it('should handle fetch errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { latency } = useNetworkLatency()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(latency.value).toBeNull()
  })
})
