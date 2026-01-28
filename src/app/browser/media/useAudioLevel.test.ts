import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAudioLevel } from './useAudioLevel'

describe('useAudioLevel', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should start audio level monitoring', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockResolvedValueOnce({
      getTracks: () => [],
    } as MediaStream)

    const { isMonitoring } = useAudioLevel()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(isMonitoring.value).toBe(true)
  })

  it('should handle microphone access error', async () => {
    vi.mocked(navigator.mediaDevices.getUserMedia).mockRejectedValueOnce(new Error('Permission denied'))

    const { isMonitoring } = useAudioLevel()

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(isMonitoring.value).toBe(false)
  })
})
