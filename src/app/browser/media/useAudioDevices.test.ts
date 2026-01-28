import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAudioDevices } from './useAudioDevices'

describe('useAudioDevices', () => {
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

  it('should enumerate audio devices', async () => {
    const mockDevices = [
      { deviceId: '1', kind: 'audioinput', label: 'Microphone' },
      { deviceId: '2', kind: 'audiooutput', label: 'Speakers' },
    ] as MediaDeviceInfo[]

    vi.mocked(navigator.mediaDevices.enumerateDevices).mockResolvedValueOnce(mockDevices)

    const { inputDevices, outputDevices } = useAudioDevices()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(inputDevices.value).toHaveLength(1)
    expect(outputDevices.value).toHaveLength(1)
  })

  it('should handle enumerateDevices error', async () => {
    vi.mocked(navigator.mediaDevices.enumerateDevices).mockRejectedValueOnce(new Error('Permission denied'))

    const { inputDevices } = useAudioDevices()

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(inputDevices.value).toHaveLength(0)
  })
})
