import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useVideoDevices } from './useVideoDevices'

describe('useVideoDevices', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        enumerateDevices: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should enumerate video devices', async () => {
    const mockDevices = [
      { deviceId: '1', kind: 'videoinput', label: 'Camera' },
      { deviceId: '2', kind: 'videoinput', label: 'Webcam' },
    ] as MediaDeviceInfo[]

    vi.mocked(navigator.mediaDevices.enumerateDevices).mockResolvedValueOnce(mockDevices)

    const { inputDevices } = useVideoDevices()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(inputDevices.value).toHaveLength(2)
  })

  it('should handle enumerateDevices error', async () => {
    vi.mocked(navigator.mediaDevices.enumerateDevices).mockRejectedValueOnce(new Error('Permission denied'))

    const { inputDevices } = useVideoDevices()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(inputDevices.value).toHaveLength(0)
  })
})
