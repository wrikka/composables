import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useScreenShare } from './useScreenShare'

describe('useScreenShare', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getDisplayMedia: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should start screen share', async () => {
    const mockStream = {
      getVideoTracks: () => [{ addEventListener: vi.fn() }],
      getTracks: () => [],
    } as MediaStream

    vi.mocked(navigator.mediaDevices.getDisplayMedia).mockResolvedValueOnce(mockStream)

    const { isSharing, stream } = useScreenShare()
    await startShare()

    expect(isSharing.value).toBe(true)
    expect(stream.value).toBe(mockStream)
  })

  it('should handle screen share error', async () => {
    vi.mocked(navigator.mediaDevices.getDisplayMedia).mockRejectedValueOnce(new Error('Permission denied'))

    const { isSharing, error } = useScreenShare()
    await startShare()

    expect(isSharing.value).toBe(false)
    expect(error.value).toBeInstanceOf(Error)
  })
})
