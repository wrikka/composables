import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNetworkJitter } from './useNetworkJitter'

describe('useNetworkJitter', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should measure network jitter', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
    } as Response)

    const { jitter, averageJitter } = useNetworkJitter()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(jitter.value).toBeGreaterThanOrEqual(0)
    expect(averageJitter.value).toBeGreaterThanOrEqual(0)
  })

  it('should maintain jitter history', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
    } as Response)

    const { jitterHistory } = useNetworkJitter(100)

    await new Promise(resolve => setTimeout(resolve, 600))

    expect(jitterHistory.value.length).toBeGreaterThan(0)
  })
})
