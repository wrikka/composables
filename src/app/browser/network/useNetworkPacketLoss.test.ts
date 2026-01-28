import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNetworkPacketLoss } from './useNetworkPacketLoss'

describe('useNetworkPacketLoss', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should measure packet loss', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
    } as Response)

    const { packetLoss, averagePacketLoss } = useNetworkPacketLoss()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(packetLoss.value).toBeGreaterThanOrEqual(0)
    expect(averagePacketLoss.value).toBeGreaterThanOrEqual(0)
  })

  it('should handle network errors as packet loss', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { packetLoss } = useNetworkPacketLoss()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(packetLoss.value).toBeGreaterThan(0)
  })
})
